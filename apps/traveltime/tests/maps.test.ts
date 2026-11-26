import { expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { googleMapsLink, mapQuery, parseMapEmbedUrl } from "../src/model/maps";
vi.mock("@oskar-lab/i18n/I18nProvider", () => ({ useI18n: () => ({ locale: "en", t: (key: string) => key }) }));
import PlaceMap from "../src/app/PlaceMap";
const embed = "https://www.google.com/maps/embed?pb=!1m18!example";
it("uses only the selected station for Google Maps search links", () => {
  const query = mapQuery("Example pier", "Harbor & Main, Example City");
  const link = new URL(googleMapsLink(query));
  expect(link.origin).toBe("https://www.google.com");
  expect(link.searchParams.get("query")).toBe("Example pier, Harbor & Main, Example City");
  expect(mapQuery("Example pier", "Example pier, Main St")).toBe("Example pier, Main St");
});
it("accepts a key-free embed URL or copied iframe HTML", () => {
  expect(parseMapEmbedUrl(embed)).toBe(embed);
  expect(parseMapEmbedUrl(`<iframe src="${embed}" width="600"></iframe>`)).toBe(embed);
});
it.each([
  "javascript:alert(1)", "https://evil.invalid/maps/embed?pb=x",
  "https://www.google.com.evil.invalid/maps/embed?pb=x", "https://user@www.google.com/maps/embed?pb=x",
  "https://www.google.com/maps/embed/v1/place?key=x&q=y", "https://www.google.com/maps/embed?pb=x&key=secret",
  "https://www.google.com/maps/embed?pb=x&pb=y", "https://www.google.com/maps/embed?hl=de",
])("rejects unsafe or billing/API-key embed source %s", (url) => {
  expect(parseMapEmbedUrl(url)).toBeNull();
});
it("does not create an external iframe until consent, even with a saved embed", () => {
  const html = renderToStaticMarkup(createElement(PlaceMap, { placeName: "Example pier", address: "Main St", mapEmbedUrl: embed }));
  expect(html).not.toContain("<iframe");
  expect(html).not.toContain("<img");
  expect(html).toContain("travel.loadMap");
  expect(html).toContain("travel.mapConsent");
  expect(html).toContain('rel="noopener noreferrer"');
  expect(html).toContain(embed);
});
it("keeps an outbound location link and an honest state when no embed is saved", () => {
  const html = renderToStaticMarkup(createElement(PlaceMap, { placeName: "Example pier", address: "Main St" }));
  expect(html).toContain("travel.mapMissing");
  expect(html).not.toContain("travel.loadMap");
  expect(html).toContain("https://www.google.com/maps/search/");
});
it("does not invent a map for a missing location", () => {
  expect(renderToStaticMarkup(createElement(PlaceMap, { placeName: "", address: "" }))).toBe("");
});
