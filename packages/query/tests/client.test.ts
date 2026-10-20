import {afterEach, expect, it, vi} from "vitest";
import {CancelledError, MutationObserver, onlineManager, QueryObserver} from "@tanstack/react-query";
import {createQueryClient, retryRead} from "../src/client";

afterEach(() => {onlineManager.setOnline(true);});

it("retries only temporary read errors within the configured limit", () => {
    expect(retryRead(0, {status: 503})).toBe(true);
    expect(retryRead(1, new TypeError("offline"))).toBe(true);
    expect(retryRead(2, {status: 503})).toBe(false);
    for (const status of [400, 401, 403, 404, 409, 429]) expect(retryRead(0, {status})).toBe(false);
    expect(retryRead(0, new CancelledError())).toBe(false);
    expect(retryRead(0, new DOMException("cancelled", "AbortError"))).toBe(false);
});

it("never shares cached data between independently mounted account scopes", () => {
    const first = createQueryClient(), second = createQueryClient();
    first.setQueryData(["personal"], {owner: "alice"});
    expect(second.getQueryData(["personal"])).toBeUndefined();
    first.clear();
    expect(first.getQueryData(["personal"])).toBeUndefined();
    second.clear();
});

it("does not queue or replay a failed write even when the browser is offline", async () => {
    onlineManager.setOnline(false);
    const client = createQueryClient();
    const mutationFn = vi.fn().mockRejectedValue(new Error("offline"));
    const observer = new MutationObserver(client, {mutationFn});
    await expect(observer.mutate()).rejects.toThrow("offline");
    expect(mutationFn).toHaveBeenCalledTimes(1);
    expect(observer.getCurrentResult().isPaused).toBe(false);
    client.clear();
});

it("leaves disabled editing queries untouched during resume and invalidation", async () => {
    const client = createQueryClient();
    const queryKey = ["editing-plan"];
    const queryFn = vi.fn();
    client.setQueryData(queryKey, {name: "original"});
    const observer = new QueryObserver(client, {queryKey, queryFn, enabled: false});
    const unsubscribe = observer.subscribe(() => {});
    await client.invalidateQueries({queryKey});
    await client.refetchQueries({type: "active", stale: true});
    expect(queryFn).not.toHaveBeenCalled();
    expect(client.getQueryData(queryKey)).toEqual({name: "original"});
    unsubscribe(); client.clear();
});

it("aborts requests when an account scope is discarded", async () => {
    const client = createQueryClient();
    let signal: AbortSignal | undefined;
    const pending = client.fetchQuery({queryKey: ["personal"], queryFn: context => {
        signal = context.signal;
        return new Promise(() => {});
    }});
    const assertion = expect(pending).rejects.toBeInstanceOf(CancelledError);
    client.clear();
    await assertion;
    expect(signal?.aborted).toBe(true);
    expect(client.getQueryData(["personal"])).toBeUndefined();
});
