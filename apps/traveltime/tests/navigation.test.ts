import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
vi.mock("@oskar-lab/i18n/I18nProvider", () => ({ useI18n: () => ({ t: (key: string) => key }) }));
import TravelNavigation from "../src/app/TravelNavigation";

it("exposes five named destinations and exactly one current section", () => {
  const html = renderToStaticMarkup(createElement(TravelNavigation, { active: "saved", hasTrip: true, canEdit: true, onNavigate: vi.fn() }));
  expect(html.match(/<button /g)).toHaveLength(5);
  expect(html.match(/aria-current="page"/g)).toHaveLength(1);
  for (const name of ["packingTitle", "timeline", "navAdd", "navSaved", "navTrips"]) expect(html).toContain(`aria-label="travel.${name}"`);
  expect(html).not.toContain("<img");
});
it("keeps trip-only destinations unavailable until a trip is selected and prohibits viewer additions", () => {
  const withoutTrip = renderToStaticMarkup(createElement(TravelNavigation, { active: "trips", hasTrip: false, canEdit: false, onNavigate: vi.fn() }));
  expect(withoutTrip.match(/disabled=""/g)).toHaveLength(4);
  const viewer = renderToStaticMarkup(createElement(TravelNavigation, { active: "timeline", hasTrip: true, canEdit: false, onNavigate: vi.fn() }));
  expect(viewer.match(/disabled=""/g)).toHaveLength(1);
});
