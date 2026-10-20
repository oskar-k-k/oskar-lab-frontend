import {afterEach, expect, it, vi} from "vitest";
import {createQueryClient} from "@oskar-lab/query/client";
import {catalogQuery} from "../src/lib/api/catalogQuery";

afterEach(() => vi.unstubAllGlobals());

it("recovers the catalog through a validated same-origin endpoint", async () => {
    vi.stubGlobal("window", {location: {origin: "http://platform.invalid"}});
    const fetcher = vi.fn().mockResolvedValue(Response.json({content: [{id: 1, path: "test-app", title: "Test", description: null}],
        totalPages: 1, totalElements: 1, size: 50, number: 0}));
    vi.stubGlobal("fetch", fetcher);
    const client = createQueryClient();
    expect(await client.fetchQuery(catalogQuery())).toEqual([{id: 1, path: "test-app", title: "Test", description: null}]);
    expect((fetcher.mock.calls[0][0] as Request).url).toBe("http://platform.invalid/api/apps");
    client.clear();
});

it("rejects malformed catalog responses without caching them", async () => {
    vi.stubGlobal("window", {location: {origin: "http://platform.invalid"}});
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({content: "invalid"})));
    const client = createQueryClient();
    await expect(client.fetchQuery({...catalogQuery(), retry: false})).rejects.toThrow("invalid page");
    expect(client.getQueryData(catalogQuery().queryKey)).toBeUndefined();
    client.clear();
});
