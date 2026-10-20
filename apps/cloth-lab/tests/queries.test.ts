import {afterEach, expect, it, vi} from "vitest";
import {MutationObserver} from "@tanstack/react-query";
import {createQueryClient} from "@oskar-lab/query/client";
import {generateImage, workerStatusQuery} from "../src/services/tryOn";

afterEach(() => vi.unstubAllGlobals());

function browser() {
    vi.stubGlobal("window", {location: {origin: "http://platform.invalid"}});
}

it("rejects an invalid readiness payload instead of showing the worker online", async () => {
    browser();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({online: "yes"})));
    const client = createQueryClient();
    await expect(client.fetchQuery({...workerStatusQuery(), retry: false})).rejects.toThrow("Invalid worker status");
    expect(client.getQueryData(workerStatusQuery().queryKey)).toBeUndefined();
    client.clear();
});

it("does not automatically replay an unsuccessful image upload", async () => {
    browser();
    const fetcher = vi.fn().mockResolvedValue(Response.json({error: "Worker unavailable"}, {status: 502}));
    vi.stubGlobal("fetch", fetcher);
    const image = new File(["fixture"], "test.png", {type: "image/png"});
    const client = createQueryClient();
    const observer = new MutationObserver(client, {mutationFn: () => generateImage(image, image, new AbortController().signal,
        {generic: "Failed", invalid: "Invalid image"})});
    await expect(observer.mutate()).rejects.toThrow("Worker unavailable");
    expect(fetcher).toHaveBeenCalledTimes(1);
    client.clear();
});

it("returns binary images without putting them in the query cache", async () => {
    browser();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(new Uint8Array([1, 2, 3]), {headers: {"Content-Type": "image/png"}})));
    const image = new File(["fixture"], "test.png", {type: "image/png"});
    const client = createQueryClient();
    const observer = new MutationObserver(client, {mutationFn: () => generateImage(image, image, new AbortController().signal,
        {generic: "Failed", invalid: "Invalid image"})});
    const result = await observer.mutate();
    expect(result).toBeInstanceOf(Blob);
    expect(client.getQueryCache().getAll()).toHaveLength(0);
    observer.reset(); client.clear();
});
