import {afterEach, expect, it, vi} from "vitest";
vi.mock("next/headers", () => ({headers: async () => new Headers({cookie: "synthetic-session"})}));
import {getCurrentUser} from "../src/platformUser";

afterEach(() => vi.unstubAllGlobals());

it("denies private access while session verification is unavailable, despite a cached identity", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({sessionUnavailable: true,
        user: {id: "cached-user", name: "test", complete: true}})));
    await expect(getCurrentUser()).rejects.toThrow("Account service unavailable");
});
