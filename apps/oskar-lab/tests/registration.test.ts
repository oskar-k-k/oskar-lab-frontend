import {beforeEach, describe, expect, it, vi} from "vitest";
const request = vi.hoisted(() => vi.fn());
vi.mock("@oskar-lab/auth/backend", () => ({accountRequest: request, AccountError: class extends Error {}}));
import {POST} from "../src/app/api/auth/register/route";
beforeEach(() => request.mockReset());

describe("registration HTTP boundary", () => {
    it("rejects cross-site and missing-origin submissions", async () => {
        for (const origin of ["https://other.invalid", "null"]) {
            const response = await POST(new Request("http://localhost:10030/api/auth/register", {method: "POST", headers: {origin, host: "127.0.0.1:10030", "content-type": "application/json"}, body: "{}"}));
            expect(response.status).toBe(403);
        }
        expect(request).not.toHaveBeenCalled();
    });
    it("accepts the actual browser host when Next uses an internal URL", async () => {
        request.mockResolvedValue({});
        const response = await POST(new Request("http://localhost:10030/api/auth/register", {method: "POST", headers: {origin: "http://127.0.0.1:10030", host: "127.0.0.1:10030", "content-type": "application/json"}, body: "{}"}));
        expect(response.status).toBe(201);
        expect(request).toHaveBeenCalledExactlyOnceWith("register", {});
    });
});
