import { parseMapEmbedUrl } from "./maps";
import type { components } from "@oskar-lab/api/backend";
const kinds = new Set([
  "FLIGHT",
  "BOAT",
  "TRAIN",
  "BUS",
  "TRANSFER",
  "HOTEL",
  "APARTMENT",
  "ACTIVITY",
  "RESTAURANT",
  "TOUR",
]);
const roles = new Set([
  "DEPARTURE",
  "ARRIVAL",
  "CHECK_IN",
  "CHECK_OUT",
  "START",
  "END",
]);
function record(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object");
}
function date(value: unknown) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const parsed = new Date(value + "T12:00:00Z");
  return (
    Number.isFinite(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}
function version(value: unknown) {
  return Number.isSafeInteger(value) && Number(value) >= 0;
}
function id(value: unknown) {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(value)
  );
}
function trip(value: unknown) {
  return (
    record(value) &&
    id(value.id) &&
    id(value.ownerId) &&
    typeof value.notes === "string" &&
    typeof value.title === "string" &&
    date(value.startDate) &&
    date(value.endDate) &&
    typeof value.canEdit === "boolean" &&
    version(value.version)
  );
}
function point(value: unknown) {
  if (
    !record(value) ||
    (value.timelineTime != null && (typeof value.timelineTime !== "string" || !/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?$/.test(value.timelineTime))) ||
    (value.timelineUtcOffset != null && (typeof value.timelineUtcOffset !== "string" || !/^(?:Z|[+-]\d{2}:\d{2}(?::\d{2})?)$/.test(value.timelineUtcOffset))) ||
    !roles.has(String(value.role)) ||
    !date(value.date) ||
    typeof value.timeZone !== "string" ||
    typeof value.placeName !== "string" ||
    typeof value.address !== "string" ||
    (value.mapEmbedUrl != null && (typeof value.mapEmbedUrl !== "string" || !parseMapEmbedUrl(value.mapEmbedUrl)))
  )
    return false;
  try {
    new Intl.DateTimeFormat("en", { timeZone: value.timeZone });
  } catch {
    return false;
  }
  return (
    (value.time === null ||
      (typeof value.time === "string" &&
        /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?$/.test(
          value.time,
        ))) &&
    (value.utcOffset === null ||
      (typeof value.utcOffset === "string" &&
        /^(?:Z|[+-]\d{2}:\d{2}(?::\d{2})?)$/.test(value.utcOffset))) &&
    ["EXACT", "NOT_BEFORE", "NOT_AFTER", "UNSPECIFIED"].includes(
      String(value.timeMeaning),
    )
  );
}
function entry(value: unknown) {
  return (
    record(value) &&
    (value.bookingSource == null || (typeof value.bookingSource === "string" && value.bookingSource.length <= 160)) &&
    id(value.id) &&
    id(value.tripId) &&
    kinds.has(String(value.type)) &&
    ["title", "notes", "reference"].every(
      (key) => typeof value[key] === "string",
    ) &&
    version(value.version) &&
    Array.isArray(value.points) &&
    value.points.length >= 1 &&
    value.points.length <= 2 &&
    value.points.every(point) &&
    (value.durationMinutes === null ||
      (typeof value.durationMinutes === "number" && value.durationMinutes >= 0))
  );
}
function viewer(value: unknown) {
  return record(value) && id(value.id) && typeof value.email === "string";
}
function attachment(value: unknown) {
  return (
    record(value) &&
    id(value.id) &&
    id(value.entryId) &&
    typeof value.filename === "string" &&
    ["application/pdf", "image/png", "image/jpeg"].includes(
      String(value.mediaType),
    ) &&
    Number.isSafeInteger(value.size) &&
    Number(value.size) > 0 &&
    Number(value.size) <= 5 * 1024 * 1024
  );
}
/** Validates the response shape for each browser travel route before it can enter React state. */
export function validTravelResponse(
  path: string,
  method: string,
  value: unknown,
): boolean {
  const route = path.split("?")[0];
  if (route.endsWith("/viewers"))
    return method === "GET"
      ? Array.isArray(value) && value.every(viewer)
      : viewer(value);
  if (route.endsWith("/attachments"))
    return method === "GET"
      ? Array.isArray(value) && value.every(attachment)
      : attachment(value);
  if (route.endsWith("/entries") && method === "GET")
    return (
      record(value) &&
      Array.isArray(value.entries) &&
      value.entries.every(entry) &&
      typeof value.hasMore === "boolean"
    );
  if (route.includes("/entries")) return entry(value);
  if (!route && method === "GET")
    return (
      record(value) &&
      Array.isArray(value.trips) &&
      value.trips.every(trip) &&
      typeof value.hasMore === "boolean"
    );
  return trip(value);
}
/** Backend-defined shapes shared by form state and timeline rendering. */
export type TravelEntry = components["schemas"]["TravelEntry"];
