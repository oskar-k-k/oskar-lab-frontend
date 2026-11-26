import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
vi.mock("@oskar-lab/i18n/I18nProvider", () => ({
  useI18n: () => ({ locale: "en", t: (key: string) => key }),
}));
import TravelTimeline from "../src/app/TravelTimeline";
import BookingDetails from "../src/app/BookingDetails";
import type { Entry } from "../src/app/TravelWorkspace";
const departure = {
  role: "DEPARTURE",
  date: "2030-12-01",
  time: "10:00:00",
  timeZone: "Europe/Berlin",
  utcOffset: "+01:00",
  timeMeaning: "EXACT",
  placeName: "Example departure airport",
  address: "Departure address",
} as Entry["points"][number];
const arrival = {
  ...departure,
  role: "ARRIVAL",
  timeZone: "Asia/Dubai",
  utcOffset: "+04:00",
  placeName: "Example arrival airport",
  address: "Arrival address",
} as Entry["points"][number];
const entry = {
  id: "example",
  type: "FLIGHT",
  title: "Example flight",
  notes: "Shared booking note",
  reference: "EXAMPLE",
  durationMinutes: 380,
  points: [departure, arrival],
} as Entry;
function render(points: Entry["points"], editing = false) {
  return renderToStaticMarkup(
    createElement(BookingDetails, {
      entry,
      points,
      editing,
      editable: false,
      disabled: false,
      onDocuments: () => {},
      onEdit: () => {},
      onDelete: () => {},
    }),
  );
}
it("limits each flight disclosure to its own airport, address and time zone", () => {
  const start = render([departure]);
  expect(start).toContain("Departure address");
  expect(start).toContain("UTC+01:00");
  expect(start).not.toContain("Arrival address");
  expect(start).not.toContain("Asia/Dubai");
  const end = render([arrival]);
  expect(end).toContain("Arrival address");
  expect(end).toContain("UTC+04:00");
  expect(end).not.toContain("Departure address");
  expect(end).not.toContain("Europe/Berlin");
});
it("keeps both endpoints in the combined edit card", () => {
  const html = render([departure, arrival], true);
  expect(html).toContain("Departure address");
  expect(html).toContain("Arrival address");
});

it.each(["FLIGHT", "BOAT"] as const)("renders %s as connected endpoints with stacked date and local time", (type) => {
  const html = renderToStaticMarkup(createElement(TravelTimeline, {
    entries: [{ ...entry, type }], now: 0, loading: false, editable: true,
    disabled: false, onDocuments: vi.fn(), onEdit: vi.fn(), onDelete: vi.fn(),
  }));
  expect((html.match(/<details /g) ?? [])).toHaveLength(2);
  expect(html).toMatch(/<time[^>]*><span[^>]*>01\.12<\/span><span[^>]*>10:00 \(UTC\+1\)<\/span><\/time>/);
  expect(html).toContain("(UTC+1)");
  expect(html).toContain("(UTC+4)");
  expect(html).toContain("6 hr 20 min");
});
