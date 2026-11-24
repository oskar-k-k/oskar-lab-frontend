import { beforeEach, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({ user: vi.fn(), fetch: vi.fn() }));
vi.mock("@oskar-lab/auth/platformUser", () => ({ getCurrentUser: state.user }));
import { GET, POST } from "../src/app/api/travel/[[...path]]/route";
beforeEach(() => {
  state.user.mockReset();
  state.fetch.mockReset();
  vi.stubGlobal("fetch", state.fetch);
  vi.stubEnv(
    "AUTH_BRIDGE_SECRET",
    "synthetic-bridge-secret-at-least-32-characters",
  );
});
it("does not call the backend for an anonymous session", async () => {
  state.user.mockResolvedValue(null);
  expect(
    (
      await GET(new Request("https://lab.invalid/api/travel"), {
        params: Promise.resolve({}),
      })
    ).status,
  ).toBe(401);
  expect(state.fetch).not.toHaveBeenCalled();
});
it("rejects cross-origin mutations before looking up a session", async () => {
  expect(
    (
      await POST(
        new Request("https://lab.invalid/api/travel", {
          method: "POST",
          headers: { origin: "https://other.invalid" },
        }),
        { params: Promise.resolve({}) },
      )
    ).status,
  ).toBe(403);
  expect(state.user).not.toHaveBeenCalled();
});
it("rejects arbitrary backend routes", async () => {
  expect(
    (
      await GET(new Request("https://lab.invalid/api/travel/admin"), {
        params: Promise.resolve({ path: ["admin"] }),
      })
    ).status,
  ).toBe(404);
  expect(state.fetch).not.toHaveBeenCalled();
});
it("derives identity from the verified session and preserves safe binary headers", async () => {
  state.user.mockResolvedValue({ id: "verified-user" });
  state.fetch.mockResolvedValue(
    new Response("private bytes", {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": "attachment; filename=test.pdf",
      },
    }),
  );
  const response = await GET(
    new Request("https://lab.invalid/api/travel", {
      headers: { "X-User-Id": "forged" },
    }),
    { params: Promise.resolve({}) },
  );
  expect(state.fetch.mock.calls[0][1].headers["X-User-Id"]).toBe(
    "verified-user",
  );
  expect(await response.text()).toBe("private bytes");
  expect(response.headers.get("cache-control")).toBe("private, no-store");
  expect(response.headers.get("content-disposition")).toContain("attachment");
});
it("does not accept oversized JSON writes", async () => {
  state.user.mockResolvedValue({ id: "verified-user" });
  const response = await POST(
    new Request("https://lab.invalid/api/travel", {
      method: "POST",
      headers: { origin: "https://lab.invalid" },
      body: "x".repeat(100001),
    }),
    { params: Promise.resolve({}) },
  );
  expect(response.status).toBe(413);
  expect(state.fetch).not.toHaveBeenCalled();
});
