import type { components } from "@oskar-lab/api/backend";
type Entry = components["schemas"]["TravelEntry"];
type Point = components["schemas"]["TravelPoint"];

/** Updates one station's time without replacing its sibling or accommodation policy times. */
export function editStationTime(entry: Entry, role: Point["role"], date: string, time: string, offset: string): components["schemas"]["TravelSaveEntry"] {
  if (!entry.points.some(point => point.role === role)) throw new Error("Unknown station");
  return {
    type: entry.type, title: entry.title, notes: entry.notes, reference: entry.reference,
    bookingSource: entry.bookingSource, version: entry.version,
    points: entry.points.map(point => {
      if (point.role !== role) return point;
      const stay = role === "CHECK_IN" || role === "CHECK_OUT";
      return stay ? { ...point, date, utcOffset: date === point.date ? point.utcOffset : null,
        timelineTime: time || null, timelineUtcOffset: time ? offset || null : null } :
        { ...point, date, time: time || null, utcOffset: time ? offset || null : null,
          timeMeaning: time ? "EXACT" : "UNSPECIFIED" };
    }),
  };
}
