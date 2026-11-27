import type { components } from "@oskar-lab/api/backend";
import { mapQuery } from "./maps";
import { timelinePoint } from "./timeline";
type Entry = components["schemas"]["TravelEntry"];
type Point = components["schemas"]["TravelPoint"];

/** A saved trip location suggested as a route origin, never a booking payload. */
export type RouteOrigin = Readonly<{ id: string; name: string; point: Point }>;

function timestamp(point: Point, endOfDay = false): number {
  const value = timelinePoint(point);
  return Date.parse(value.date + "T" + (value.time ?? (endOfDay ? "23:59:59" : "00:00:00")) + (value.utcOffset ?? "Z"));
}

/** Arrival, checkout and end points already have an incoming booking connection. */
export function canOpenRoute(point: Point): boolean {
  return !["ARRIVAL", "CHECK_OUT", "END"].includes(point.role) && Boolean(mapQuery(point.placeName, point.address));
}

/** Prefers the active stay for independent activities; otherwise uses recent stays or transport arrivals. */
export function routeOrigins(entries: readonly Entry[], targetEntry: Entry, target: Point): RouteOrigin[] {
  if (!canOpenRoute(target)) return [];
  const at = timestamp(target, true);
  const destination = mapQuery(target.placeName, target.address).toLocaleLowerCase();
  const candidates = entries.flatMap(entry => {
    if (entry.id === targetEntry.id) return [];
    const stay = entry.type === "HOTEL" || entry.type === "APARTMENT";
    const point = entry.points.find(p => p.role === (stay ? "CHECK_IN" : "ARRIVAL"));
    if (!point || timestamp(point) > at || !mapQuery(point.placeName, point.address)) return [];
    if (mapQuery(point.placeName, point.address).toLocaleLowerCase() === destination) return [];
    const checkout = stay ? entry.points.find(p => p.role === "CHECK_OUT") : undefined;
    return [{ id: `${entry.id}:${point.role}`, name: point.placeName || entry.title, point,
      active: Boolean(checkout && timestamp(checkout, true) >= at), at: timestamp(point) }];
  }).sort((a,b) => Number(b.active) - Number(a.active) || b.at - a.at || a.id.localeCompare(b.id));
  const seen = new Set<string>();
  return candidates.filter(candidate => {
    const query = mapQuery(candidate.point.placeName, candidate.point.address).toLocaleLowerCase();
    if (seen.has(query)) return false;
    seen.add(query); return true;
  }).slice(0,8).map(({id,name,point}) => ({id,name,point}));
}

/** Opens directions using only the selected locations; omitting origin delegates current-location handling to Maps. */
export function googleMapsRoute(destination: Point, origin?: Point): string {
  const url = new URL("https://www.google.com/maps/dir/");
  url.searchParams.set("api", "1");
  url.searchParams.set("destination", mapQuery(destination.placeName, destination.address));
  if (origin) url.searchParams.set("origin", mapQuery(origin.placeName, origin.address));
  return url.toString();
}
