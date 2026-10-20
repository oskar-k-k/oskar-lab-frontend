import {afterEach, expect, it, vi} from "vitest";
import {createQueryClient} from "@oskar-lab/query/client";
import {request} from "../src/services/client";

const valid = (value: unknown): value is string => typeof value === "string";
afterEach(() => {vi.useRealTimers(); vi.unstubAllGlobals();});

it("recovers a read when the connection returns after standby", async () => {
    vi.useFakeTimers();
    const fetcher = vi.fn().mockRejectedValueOnce(new TypeError("offline")).mockResolvedValueOnce(Response.json("ready"));
    vi.stubGlobal("fetch", fetcher);
    const client = createQueryClient();
    const result = client.fetchQuery({queryKey: ["templates"], queryFn: () => request("templates", valid)});
    await vi.runAllTimersAsync();
    expect(await result).toBe("ready");
    expect(fetcher).toHaveBeenCalledTimes(2);
    client.clear();
});

it("does not replay saves or retry a missing plan", async () => {
    const fetcher = vi.fn().mockRejectedValueOnce(new TypeError("offline"));
    vi.stubGlobal("fetch", fetcher);
    await expect(request("logs", valid, {id: "4dcd07cd-46cb-4e54-9e7d-7aa8a94b0ce1", exerciseId: "4dcd07cd-46cb-4e54-9e7d-7aa8a94b0ce1", trackingMode: "reps", sets: [{setNumber: 1, value: 8, weight: null}]}, "POST")).rejects.toMatchObject({status: 503});
    expect(fetcher).toHaveBeenCalledTimes(1);
    fetcher.mockResolvedValueOnce(new Response(null, {status: 404}));
    await expect(request("plans/missing", valid)).rejects.toMatchObject({status: 404});
    expect(fetcher).toHaveBeenCalledTimes(2);
});

it("rejects a late response after its account scope aborts the request", async () => {
    const controller = new AbortController();
    let finish: (response: Response) => void = () => {};
    let upstream: Request | undefined;
    vi.stubGlobal("fetch", vi.fn((request: Request) => {
        upstream = request;
        return new Promise<Response>(resolve => {finish = resolve;});
    }));
    const pending = request("templates", valid, undefined, "GET", controller.signal);
    const assertion = expect(pending).rejects.toMatchObject({name: "AbortError"});
    controller.abort();
    finish(Response.json("obsolete result"));
    await assertion;
    expect(upstream?.signal.aborted).toBe(true);
});
