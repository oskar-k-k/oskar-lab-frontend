import {describe, expect, it, vi, afterEach} from "vitest";
import {NextRequest} from "next/server";
import {GET, POST} from "../src/app/api/game/[...path]/route";
afterEach(() => vi.unstubAllGlobals());
describe("game proxy", () => {
    it("accepts the original platform origin behind the app proxy", async () => {
        const fetch = vi.fn().mockResolvedValue(Response.json({code:"123456"})); vi.stubGlobal("fetch", fetch);
        const response = await POST(new NextRequest("http://127.0.0.1:10040/api/game/rooms", {method:"POST", headers:{origin:"http://localhost:10030", "x-forwarded-host":"localhost:10030", "x-forwarded-proto":"http"}, body:"{}"}), {params:Promise.resolve({path:["rooms"]})});
        expect(response.status).toBe(200);
    });
    it("rejects foreign origins and arbitrary upstream paths", async () => {
        const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
        const response = await POST(new NextRequest("http://localhost:10040/api/game/rooms", {method:"POST", headers:{origin:"https://foreign.example"}}), {params:Promise.resolve({path:["rooms"]})});
        expect(response.status).toBe(403);
        expect((await GET(new NextRequest("http://localhost:10040/api/game/internal"), {params:Promise.resolve({path:["internal","auth"]})})).status).toBe(404);
        expect(fetch).not.toHaveBeenCalled();
    });
    it("forwards only the game credential and disables caching", async () => {
        const fetch = vi.fn().mockResolvedValue(Response.json({phase:"lobby"})); vi.stubGlobal("fetch", fetch);
        const response = await GET(new NextRequest("http://localhost:10040/api/game/rooms/123456", {headers:{"x-tierlist-token":"guest-credential",cookie:"private-platform-session"}}), {params:Promise.resolve({path:["rooms","123456"]})});
        expect(response.headers.get("cache-control")).toBe("no-store");
        expect(fetch.mock.calls[0][1].headers).toEqual({"Content-Type":"application/json","X-Tierlist-Token":"guest-credential"});
    });
});
