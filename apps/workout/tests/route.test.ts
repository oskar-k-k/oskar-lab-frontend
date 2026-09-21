import {afterEach, describe, expect, it, vi} from "vitest";
const currentUser = vi.hoisted(() => vi.fn());
vi.mock("@oskar-lab/auth/platformUser", () => ({getCurrentUser: currentUser}));
import {GET, POST} from "../src/app/api/workout/[...path]/route";
import {newEntry} from "../src/model/workout";

const id = "4dcd07cd-46cb-4e54-9e7d-7aa8a94b0ce1";
const context = (path: string[]) => ({params: Promise.resolve({path})});
afterEach(() => {vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.resetAllMocks();});
describe("workout platform bridge", () => {
    it("serves public templates without looking up a user", async () => {
        vi.stubEnv("AUTH_BRIDGE_SECRET", "synthetic-secret-at-least-32-characters");
        const fetcher = vi.fn().mockResolvedValue(Response.json([])); vi.stubGlobal("fetch", fetcher);
        expect((await GET(new Request("http://localhost/api/workout/templates"), context(["templates"]))).status).toBe(200);
        expect(currentUser).not.toHaveBeenCalled();
        expect(fetcher.mock.calls[0][1].headers["X-Auth-Bridge"]).toBe("synthetic-secret-at-least-32-characters");
    });
    it("rejects cross-origin writes and forged client identities", async () => {
        const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
        expect((await POST(new Request("http://localhost/api/workout/plans", {method: "POST", headers: {origin: "http://attacker.example"}}), context(["plans"]))).status).toBe(403);
        vi.stubEnv("AUTH_BRIDGE_SECRET", "synthetic-secret-at-least-32-characters");
        currentUser.mockResolvedValue(null);
        expect((await GET(new Request("http://localhost/api/workout/plans", {headers: {"X-User-Id": id}}), context(["plans"]))).status).toBe(401);
        expect(fetcher).not.toHaveBeenCalled();
    });
    it("uses only the server-verified identity and validates drafts", async () => {
        vi.stubEnv("AUTH_BRIDGE_SECRET", "synthetic-secret-at-least-32-characters");
        currentUser.mockResolvedValue({id});
        const fetcher = vi.fn().mockResolvedValue(Response.json({})); vi.stubGlobal("fetch", fetcher);
        const draft = {id, name: "Plan", notes: "", version: 0, template: false, exercises: [newEntry(id)]};
        const make = (body: unknown) => new Request("http://localhost/api/workout/plans", {method: "POST", headers: {origin: "http://localhost", "X-User-Id": "forged"}, body: JSON.stringify(body)});
        expect((await POST(make({...draft, exercises: []}), context(["plans"]))).status).toBe(400);
        expect(fetcher).not.toHaveBeenCalled();
        expect((await POST(make(draft), context(["plans"]))).status).toBe(200);
        expect(fetcher.mock.calls[0][1].headers["X-User-Id"]).toBe(id);
    });
    it("accepts the configured platform origin behind its reverse proxy", async () => {
        vi.stubEnv("AUTH_BRIDGE_SECRET", "synthetic-secret-at-least-32-characters");
        vi.stubEnv("AUTH_PLATFORM_URL", "http://localhost:10030");
        currentUser.mockResolvedValue({id});
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({})));
        const draft = {id, name: "Plan", notes: "", version: 0, template: false, exercises: [newEntry(id)]};
        const request = new Request("http://localhost:10036/apps/workout/api/workout/plans", {
            method: "POST", headers: {origin: "http://localhost:10030"}, body: JSON.stringify(draft),
        });
        expect((await POST(request, context(["plans"]))).status).toBe(200);
    });
    it("requires a verified account for history and validates tracking writes", async () => {
        vi.stubEnv("AUTH_BRIDGE_SECRET", "synthetic-secret-at-least-32-characters");
        const fetcher = vi.fn().mockResolvedValue(Response.json({})); vi.stubGlobal("fetch", fetcher);
        currentUser.mockResolvedValue(null);
        expect((await GET(new Request(`http://localhost/api/workout/history/${id}`), context(["history", id]))).status).toBe(401);
        currentUser.mockResolvedValue({id});
        const log = {id, planId: id, planVersion: 0, position: 0, exerciseId: id, trackingMode: "weighted", sets: [{setNumber: 1, value: 8, weight: 12.5}]};
        const make = (body: unknown) => new Request("http://localhost/api/workout/logs", {method: "POST", headers: {origin: "http://localhost"}, body: JSON.stringify(body)});
        expect((await POST(make({...log, sets: []}), context(["logs"]))).status).toBe(400);
        expect((await POST(make(log), context(["logs"]))).status).toBe(200);
        expect(fetcher.mock.calls[0][1].headers["X-User-Id"]).toBe(id);
        await GET(new Request(`http://localhost/api/workout/history/${id}?page=2`), context(["history", id]));
        expect(fetcher.mock.calls[1][0]).toContain(`history/${id}?page=2`);
    });

});
