import { expect, it } from "vitest";
import type { components } from "@oskar-lab/api/backend";
import { canOpenRoute, googleMapsRoute, routeOrigins } from "../src/model/routes";

type Entry = components["schemas"]["TravelEntry"];
type Point = Entry["points"][number];
function point(role: Point["role"], date: string, placeName: string, time = "20:00:00"): Point {
  return { role, date, placeName, address: `${placeName}, Example street`, time,
    utcOffset: "+07:00", timeZone: "Asia/Bangkok", timeMeaning: "EXACT",
    mapEmbedUrl: null, timelineTime: null, timelineUtcOffset: null, timelineDate: null };
}
function entry(id: string, type: Entry["type"], points: Point[]): Entry {
  return { id, type, points, title: id, notes: "PRIVATE NOTE", reference: "PRIVATE REFERENCE" } as Entry;
}
const hotel = entry("hotel", "HOTEL", [
  { ...point("CHECK_IN", "2030-12-27", "Hotel"), timelineTime: "20:00:00", timelineUtcOffset: "+07:00" },
  { ...point("CHECK_OUT", "2031-01-02", "Hotel"), timelineTime: "17:00:00", timelineUtcOffset: "+07:00" },
]);
const arrival = entry("flight", "FLIGHT", [point("ARRIVAL", "2030-12-27", "Airport", "18:00:00")]);

it("keeps both activities anchored to the active hotel instead of the preceding activity", () => {
  const events = ["2030-12-30", "2030-12-31"].map((date, index) =>
    entry(`event${index}`, "ACTIVITY", [point("START", date, `Venue${index}`)]));
  for (const event of events) {
    const origins = routeOrigins([arrival, hotel, ...events], event, event.points[0]);
    expect(origins.map(origin => origin.name)).toEqual(["Hotel", "Airport"]);
  }
});

it("uses the prior arrival for check-in and ignores future anchors and the booking itself", () => {
  const future = entry("future", "BOAT", [point("ARRIVAL", "2031-01-03", "Future pier")]);
  expect(routeOrigins([hotel, arrival, future], hotel, hotel.points[0]).map(origin => origin.name)).toEqual(["Airport"]);
});

it("uses actual offsets and planned hotel times when excluding future origins", () => {
  const event = entry("event", "ACTIVITY", [point("START", "2030-12-27", "Venue", "19:00:00")]);
  const later = entry("later", "FLIGHT", [{ ...point("ARRIVAL", "2030-12-27", "Later airport", "14:00:00"), utcOffset: "+01:00" }]);
  expect(routeOrigins([hotel, arrival, later], event, event.points[0]).map(origin => origin.name)).toEqual(["Airport"]);
});

it("uses the latest arrival after a stay and excludes routes to the same location", () => {
  const boat = entry("boat", "BOAT", [point("ARRIVAL", "2031-01-03", "Pier")]);
  const event = entry("event", "ACTIVITY", [point("START", "2031-01-04", "Venue")]);
  expect(routeOrigins([hotel, arrival, boat], event, event.points[0])[0].name).toBe("Pier");
  const same = entry("same", "ACTIVITY", [point("START", "2031-01-04", "Pier")]);
  expect(routeOrigins([boat], same, same.points[0])).toEqual([]);
});

it("omits incoming routes for connected arrival, checkout and end stations", () => {
  for (const role of ["ARRIVAL", "CHECK_OUT", "END"] as const) {
    const target = point(role, "2031-01-04", "Venue");
    expect(canOpenRoute(target)).toBe(false);
    expect(routeOrigins([hotel], entry("target", "ACTIVITY", [target]), target)).toEqual([]);
  }
  expect(canOpenRoute({ ...point("START", "2031-01-04", ""), address: "" })).toBe(false);
});

it("encodes only the selected locations and delegates current location by omitting origin", () => {
  const destination = point("START", "2030-12-30", "Rooftop & café");
  const url = new URL(googleMapsRoute(destination, hotel.points[0]));
  expect(url.origin + url.pathname).toBe("https://www.google.com/maps/dir/");
  expect([...url.searchParams.keys()]).toEqual(["api", "destination", "origin"]);
  expect(url.searchParams.get("destination")).toContain("Rooftop & café");
  expect(url.searchParams.get("origin")).toContain("Hotel");
  expect(url.toString()).not.toMatch(/2030|PRIVATE|embed|key=/);
  expect(new URL(googleMapsRoute(destination)).searchParams.has("origin")).toBe(false);
});
