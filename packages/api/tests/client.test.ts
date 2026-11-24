import {afterEach, expect, it, vi} from "vitest";
import {createBackendClient, createBrowserClient, multipartBody} from "../src/client";

afterEach(() => vi.unstubAllGlobals());

it("uses generated travel contracts for trip creation without accepting an owner email", async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json({id: "trip", canEdit: true}, {status: 201}));
    vi.stubGlobal("fetch", fetcher);
    await createBackendClient({baseUrl: "http://backend.invalid", headers: {"X-Auth-Bridge": "test-only"}})
        .POST("/internal/travel/trips", {
            params: {header: {"X-User-Id": "verified-account"}},
            body: {title: "Example journey", startDate: "2030-12-01", endDate: "2030-12-10", version: 0},
        });
    const request = fetcher.mock.calls[0][0] as Request;
    expect(request.url).toBe("http://backend.invalid/internal/travel/trips");
    expect(request.headers.get("X-User-Id")).toBe("verified-account");
    expect(await request.json()).toEqual({title: "Example journey", startDate: "2030-12-01", endDate: "2030-12-10", version: 0});
});

it("serializes generated paths, query parameters and server identity headers", async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json({entries: [], hasMore: false}));
    vi.stubGlobal("fetch", fetcher);
    await createBackendClient({baseUrl: "http://backend.invalid", headers: {"X-Auth-Bridge": "test-only"}})
        .GET("/internal/workout/history/{exerciseId}", {params: {path: {exerciseId: "exercise"}, query: {page: 2}, header: {"X-User-Id": "verified"}}});
    const request = fetcher.mock.calls[0][0] as Request;
    expect(request.url).toBe("http://backend.invalid/internal/workout/history/exercise?page=2");
    expect(request.headers.get("X-User-Id")).toBe("verified");
    expect(request.headers.get("X-Auth-Bridge")).toBe("test-only");
});

it("keeps browser requests base-path aware and free of server credentials", async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json([]));
    vi.stubGlobal("fetch", fetcher);
    await createBrowserClient("https://lab.invalid/apps/workout").GET("/api/workout/templates");
    const request = fetcher.mock.calls[0][0] as Request;
    expect(request.url).toBe("https://lab.invalid/apps/workout/api/workout/templates");
    expect(request.headers.has("X-Auth-Bridge")).toBe(false);
    expect(request.headers.has("X-User-Id")).toBe(false);
});

it("sends multipart images with a generated boundary and preserves the binary response", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(new Uint8Array([1, 2, 3]), {headers: {"content-type": "image/png"}}));
    vi.stubGlobal("fetch", fetcher);
    const photo = new Blob(["image"], {type: "image/png"});
    const result = await createBrowserClient("https://lab.invalid/apps/cloth-lab").POST("/api/try-on", {
        body: {person: photo, garment: photo}, bodySerializer: multipartBody, parseAs: "blob",
    });
    const request = fetcher.mock.calls[0][0] as Request;
    expect(request.headers.get("content-type")).toContain("multipart/form-data; boundary=");
    const body = await request.formData();
    expect(await (body.get("person") as File).text()).toBe("image");
    expect(await result.data?.arrayBuffer()).toEqual(new Uint8Array([1, 2, 3]).buffer);
});

it("retains structured errors and does not retry a rejected registration", async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json({code: "accountExists"}, {status: 409}));
    vi.stubGlobal("fetch", fetcher);
    const result = await createBrowserClient("https://lab.invalid").POST("/api/auth/register", {body: {}});
    expect(result.response.status).toBe(409);
    expect(result.error).toEqual({code: "accountExists"});
    expect(fetcher).toHaveBeenCalledTimes(1);
});
