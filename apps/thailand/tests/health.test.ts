import {beforeEach, expect, it, vi} from "vitest";
vi.mock("server-only", () => ({}));
const state = vi.hoisted(() => ({ready: vi.fn()}));
vi.mock("../src/lib/data", () => ({tripDataReady: state.ready}));
import {GET} from "../src/app/health/route";
beforeEach(() => state.ready.mockReset());
it("reports readiness only when the migrated private index is present", async () => {
    state.ready.mockResolvedValue(true);
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.text()).toBe("ok");
});
it("reports a missing migrated index without disclosing private details", async () => {
    state.ready.mockResolvedValue(false);
    const response = await GET();
    expect(response.status).toBe(503);
    expect(await response.text()).toBe("unavailable");
});
it("keeps liveness separate from optional travel-data readiness", async () => {
    expect((await GET(new Request("http://localhost/health?probe=liveness"))).status).toBe(200);
    expect(state.ready).not.toHaveBeenCalled();
});
