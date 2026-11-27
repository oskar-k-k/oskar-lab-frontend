import type { components } from "@oskar-lab/api/backend";
type Entry = components["schemas"]["TravelEntry"];
export type TimelineRow = { entry: Entry; points: Entry["points"] };
/** Uses independently planned stay times; accommodation windows never imply an arrival or departure. */
export function timelinePoint(point: Entry["points"][number]): Entry["points"][number] {
  if (point.role !== "CHECK_IN" && point.role !== "CHECK_OUT") return point;
  return { ...point, time: point.timelineTime ?? null, utcOffset: point.timelineUtcOffset ?? null,
    timeMeaning: point.timelineTime ? "EXACT" : "UNSPECIFIED" };
}

/** Counts local calendar nights, unaffected by daylight-saving clock changes. */
export function stayNights(entry: Entry): number {
  const start = entry.points.find(p => p.role === "CHECK_IN");
  const end = entry.points.find(p => p.role === "CHECK_OUT");
  if (!start || !end) return 0;
  return Math.max(0, Math.round((Date.parse(end.date + "T00:00:00Z") - Date.parse(start.date + "T00:00:00Z")) / 86400000));
}
/** Separates stay endpoints so other bookings can appear between check-in and check-out. */
export function timelineRows(entries: readonly Entry[]): TimelineRow[] {
  return entries
    .flatMap((entry) =>
      entry.type === "HOTEL" || entry.type === "APARTMENT"
        ? entry.points.map((point) => ({ entry, points: [point] }))
        : [{ entry, points: entry.points }],
    )
    .sort(
      (a, b) =>
        (a.points[0].date + (timelinePoint(a.points[0]).time ?? "23:59:59")).localeCompare(
          b.points[0].date + (timelinePoint(b.points[0]).time ?? "23:59:59"),
        ) || a.entry.id.localeCompare(b.entry.id),
    );
}
/** Finds a not-yet-finished booking without inventing an exact hour for date-only points. */
export function nextTimelineRow(
  rows: readonly TimelineRow[],
  now: number,
): TimelineRow | undefined {
  return rows.find((row) => {
    const point = timelinePoint(row.points.at(-1)!);
    if (point.time && point.utcOffset)
      return Date.parse(point.date + "T" + point.time + point.utcOffset) >= now;
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: point.timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(now));
    return point.date >= today;
  });
}

/** Uses backend-computed elapsed time, including time-zone changes; unknown durations remain explicit. */
export function flightDuration(entry: Entry, locale: string): string | null {
  if (entry.durationMinutes === null) return null;
  const hours = Math.floor(entry.durationMinutes / 60);
  const minutes = entry.durationMinutes % 60;
  const format = (value: number, unit: "hour" | "minute") =>
    new Intl.NumberFormat(locale, {
      style: "unit",
      unit,
      unitDisplay: "short",
    }).format(value);
  return [
    hours > 0 ? format(hours, "hour") : null,
    minutes > 0 || hours === 0 ? format(minutes, "minute") : null,
  ]
    .filter(Boolean)
    .join(" ");
}

/** Formats the backend-validated offset for this exact local timestamp without guessing unknown times. */
export function pointUtcOffset(
  point: Entry["points"][number],
  compact = false,
): string | null {
  if (!point.time || !point.utcOffset) return null;
  const offset = point.utcOffset === "Z" ? "+00:00" : point.utcOffset;
  if (!compact) return "UTC" + offset;
  const hours = Number(offset.slice(1, 3));
  const minutes = offset.slice(4, 6);
  return `UTC${offset[0]}${hours}${minutes === "00" ? "" : ":" + minutes}`;
}
