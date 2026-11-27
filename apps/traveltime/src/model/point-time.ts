import type { components } from "@oskar-lab/api/backend";
type Point = components["schemas"]["TravelPoint"];
type EntryType = components["schemas"]["TravelEntry"]["type"];

/** Booking semantics follow the station role, never a separate user-selected time mode. */
export function bookingTimeMeaning(role: Point["role"], time: string | null): Point["timeMeaning"] {
  if (!time) return "UNSPECIFIED";
  return role === "CHECK_IN" ? "NOT_BEFORE" : role === "CHECK_OUT" ? "NOT_AFTER" : "EXACT";
}

/** Returns the app-local translation key for the actual booked time or hotel policy. */
export function bookingTimeLabel(role: Point["role"]) {
  return { DEPARTURE: "departureTime", ARRIVAL: "arrivalTime", CHECK_IN: "checkInFrom", CHECK_OUT: "checkOutUntil", START: "eventStarts", END: "eventEnds" }[role];
}

/** Distinguishes airport presence from landing and gives each station a clear personal-plan label. */
export function plannedTimeLabel(type: EntryType, role: Point["role"]) {
  if (role === "CHECK_IN") return "plannedCheckIn";
  if (role === "CHECK_OUT") return "plannedCheckOut";
  if (role === "DEPARTURE") {
    if (type === "FLIGHT") return "airportArrival";
    if (type === "BOAT") return "pierArrival";
    if (type === "TRAIN") return "stationArrival";
    if (type === "BUS") return "busStopArrival";
    return "plannedPickup";
  }
  return role === "END" ? "plannedDeparture" : "plannedArrival";
}

/** Reuses a validated offset only for the same local clock; changed dates/zones are resolved again by the server. */
export function editedUtcOffset(original: Point | undefined, date: string, time: string, zone: string, supplied: string): string | null {
  if (!time) return null;
  if (supplied) return supplied;
  return original?.date === date && original.time?.slice(0, 5) === time.slice(0, 5) && original.timeZone === zone ? original.utcOffset : null;
}
