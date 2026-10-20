import {afterEach, expect, it, vi} from "vitest";
import {InfiniteQueryObserver} from "@tanstack/react-query";
import {createQueryClient} from "@oskar-lab/query/client";
import {catalogQuery, historyQuery, personalPlansQuery, workoutKeys} from "../src/services/queries";

afterEach(() => vi.unstubAllGlobals());

it("deduplicates catalog reads across session and exercise views", async () => {
    const fetcher = vi.fn().mockImplementation(() => Promise.resolve(Response.json([])));
    vi.stubGlobal("fetch", fetcher);
    const client = createQueryClient();
    await Promise.all([client.fetchQuery(catalogQuery()), client.fetchQuery(catalogQuery())]);
    await client.fetchQuery(catalogQuery());
    expect(fetcher).toHaveBeenCalledTimes(1);
    client.clear();
});

it("requests the next personal page and retains the loaded pages", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(Response.json({plans: [], hasMore: true}))
        .mockResolvedValueOnce(Response.json({plans: [], hasMore: false}));
    vi.stubGlobal("fetch", fetcher);
    const client = createQueryClient();
    const options = personalPlansQuery("alice");
    await client.fetchInfiniteQuery(options);
    const observer = new InfiniteQueryObserver(client, options);
    await observer.fetchNextPage();
    expect((fetcher.mock.calls[0][0] as Request).url).toContain("page=0");
    expect((fetcher.mock.calls[1][0] as Request).url).toContain("page=1");
    expect(observer.getCurrentResult().data?.pages).toHaveLength(2);
    expect(observer.getCurrentResult().hasNextPage).toBe(false);
    client.clear();
});

it("separates personal plans and history by account and exercise", () => {
    expect(personalPlansQuery("alice").queryKey).not.toEqual(personalPlansQuery("bob").queryKey);
    expect(historyQuery("alice", "one").queryKey).not.toEqual(historyQuery("alice", "two").queryKey);
    expect(workoutKeys.plan("alice", "same")).not.toEqual(workoutKeys.plan("bob", "same"));
});
