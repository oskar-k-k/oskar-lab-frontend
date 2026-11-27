import type { components } from "@oskar-lab/api/backend";
type Entry = components["schemas"]["TravelEntry"];
type Point = components["schemas"]["TravelPoint"];

/** Updates only a station's personal plan; booked dates, policy times and sibling points stay intact. */
export function editStationTime(entry: Entry, role: Point["role"], date: string, time: string, offset: string): components["schemas"]["TravelSaveEntry"] {
  if (!entry.points.some(point => point.role === role)) throw new Error("Unknown station");
  return {
    type: entry.type, title: entry.title, notes: entry.notes, reference: entry.reference,
    bookingSource: entry.bookingSource, version: entry.version,
    points: entry.points.map(point => {
      if (point.role !== role) return point;
      return { ...point, timelineDate: time ? date : null, timelineTime: time || null, timelineUtcOffset: time ? offset || null : null };
    }),
  };
}
