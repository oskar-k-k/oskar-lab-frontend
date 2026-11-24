import { expect, it } from "vitest";
import {
  timelineRows,
  nextTimelineRow,
  flightDuration,
} from "../src/model/timeline";
import type { Entry } from "../src/app/TravelWorkspace";
it("interleaves an activity with connected hotel endpoints while keeping flights grouped", () => {
  const point = (role: string, date: string) => ({
    role,
    date,
    time: null,
    timeZone: "Asia/Bangkok",
    utcOffset: null,
    timeMeaning: "UNSPECIFIED",
    placeName: "Example",
    address: "",
  });
  const stay = {
    id: "stay",
    type: "HOTEL",
    points: [point("CHECK_IN", "2030-12-01"), point("CHECK_OUT", "2030-12-05")],
  } as Entry;
  const activity = {
    id: "activity",
    type: "ACTIVITY",
    points: [point("START", "2030-12-03")],
  } as Entry;
  const flight = {
    id: "flight",
    type: "FLIGHT",
    points: [point("DEPARTURE", "2030-12-06"), point("ARRIVAL", "2030-12-07")],
  } as Entry;
  const rows = timelineRows([flight, activity, stay]);
  expect(rows.map((row) => row.entry.id)).toEqual([
    "stay",
    "activity",
    "stay",
    "flight",
  ]);
  expect(rows[3].points).toHaveLength(2);
});

it("uses offsets across time zones and keeps date-only events available for their local day", () => {
  const exact = {
    id: "flight",
    type: "FLIGHT",
    points: [
      {
        role: "DEPARTURE",
        date: "2030-12-01",
        time: "20:00:00",
        utcOffset: "+01:00",
        timeZone: "Europe/Berlin",
      },
      {
        role: "ARRIVAL",
        date: "2030-12-02",
        time: "12:00:00",
        utcOffset: "+07:00",
        timeZone: "Asia/Bangkok",
      },
    ],
  } as Entry;
  const dayOnly = {
    id: "activity",
    type: "ACTIVITY",
    points: [
      {
        role: "START",
        date: "2030-12-03",
        time: null,
        utcOffset: null,
        timeZone: "Asia/Bangkok",
      },
    ],
  } as Entry;
  const rows = timelineRows([exact, dayOnly]);
  expect(
    nextTimelineRow(rows, Date.parse("2030-12-02T04:59:00Z"))?.entry.id,
  ).toBe("flight");
  expect(
    nextTimelineRow(rows, Date.parse("2030-12-02T06:00:00Z"))?.entry.id,
  ).toBe("activity");
  expect(
    nextTimelineRow(rows, Date.parse("2030-12-03T16:59:00Z"))?.entry.id,
  ).toBe("activity");
  expect(
    nextTimelineRow(rows, Date.parse("2030-12-03T17:01:00Z")),
  ).toBeUndefined();
});

it("formats the backend elapsed flight duration instead of subtracting local clock times", () => {
  const entry = { durationMinutes: 620 } as Entry;
  expect(flightDuration(entry, "en")).toMatch(/10.*20/);
  expect(flightDuration(entry, "de")).toMatch(/10.*20/);
  expect(flightDuration({ ...entry, durationMinutes: 60 }, "en")).toMatch(/1/);
  expect(flightDuration({ ...entry, durationMinutes: null }, "en")).toBeNull();
  expect(flightDuration({ ...entry, durationMinutes: 0 }, "en")).toMatch(/0/);
});
