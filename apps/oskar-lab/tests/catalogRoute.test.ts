import {afterEach, expect, it, vi} from "vitest";

const backend = vi.hoisted(() => vi.fn());
vi.mock("../src/lib/api/apps", () => ({appsApi: {getAll: backend}}));
import {GET} from "../src/app/api/apps/route";

afterEach(() => backend.mockReset());

it("serves the public catalog without caching the HTTP response", async () => {
    backend.mockResolvedValue({content: []});
    const response = await GET();
    expect(await response.json()).toEqual({content: []});
    expect(response.headers.get("cache-control")).toBe("no-store");
});

it("returns a recoverable status without exposing backend diagnostics", async () => {
    backend.mockRejectedValue(new Error("private backend detail"));
    const response = await GET();
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({code: "unavailable"});
});
