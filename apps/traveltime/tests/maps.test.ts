import { beforeEach, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { googleMapsEmbed, googleMapsLink, mapQuery } from "../src/model/maps";
const state = vi.hoisted(() => ({ user: vi.fn() }));
vi.mock("@oskar-lab/auth/platformUser", () => ({ getCurrentUser: state.user }));
vi.mock("@oskar-lab/i18n/I18nProvider", () => ({ useI18n: () => ({ locale: "en", t: (key: string) => key }) }));
import { GET } from "../src/app/api/maps/route";
import PlaceMap from "../src/app/PlaceMap";
beforeEach(() => { state.user.mockReset(); vi.stubEnv("GOOGLE_MAPS_EMBED_PUBLIC_KEY", ""); });
it("encodes only the selected station's name and address on fixed Google origins", () => {
  const query = mapQuery("Example pier", "Harbor & Main, Example City");
  const link = new URL(googleMapsLink(query));
  expect(link.origin).toBe("https://www.google.com");
  expect(link.searchParams.get("query")).toBe("Example pier, Harbor & Main, Example City");
  const embed = new URL(googleMapsEmbed(query, "synthetic-public-embed-key", "de"));
  expect(embed.pathname).toBe("/maps/embed/v1/place");
  expect(embed.searchParams.get("q")).toBe(query);
  expect(embed.searchParams.get("language")).toBe("de");
  expect(mapQuery("Example pier", "Example pier, Main St")).toBe("Example pier, Main St");
});
it("renders no external iframe or image before consent, and keeps an outbound link", () => {
  const html = renderToStaticMarkup(createElement(PlaceMap, { placeName: "Example pier", address: "Main St" }));
  expect(html).not.toContain("<iframe");
  expect(html).not.toContain("<img");
  expect(html).toContain("travel.loadMap");
  expect(html).toContain("travel.mapConsent");
  expect(html).toContain('rel="noopener noreferrer"');
  expect(html).toContain("https://www.google.com/maps/search/");
});
it("does not invent a map for a missing location", () => {
  expect(renderToStaticMarkup(createElement(PlaceMap, { placeName: "", address: "" }))).toBe("");
});
it("denies map configuration to anonymous browsers", async () => {
  state.user.mockResolvedValue(null);
  vi.stubEnv("GOOGLE_MAPS_EMBED_PUBLIC_KEY", "synthetic-public-embed-key");
  const response = await GET();
  expect(response.status).toBe(401);
  expect(await response.json()).toEqual({ code: "unauthorized" });
  expect(response.headers.get("cache-control")).toBe("private, no-store");
});
it("reports unavailable configuration without exposing internal errors", async () => {
  state.user.mockResolvedValue({ id: "synthetic-user" });
  expect((await GET()).status).toBe(503);
  state.user.mockRejectedValue(new Error("private session details"));
  expect(await (await GET()).json()).toEqual({ code: "unavailable" });
});
it("returns only the deliberately public key after authentication", async () => {
  state.user.mockResolvedValue({ id: "synthetic-user" });
  vi.stubEnv("GOOGLE_MAPS_EMBED_PUBLIC_KEY", "synthetic-public-embed-key");
  const response = await GET();
  expect(await response.json()).toEqual({ publicKey: "synthetic-public-embed-key" });
  expect(response.headers.get("cache-control")).toBe("private, no-store");
});
