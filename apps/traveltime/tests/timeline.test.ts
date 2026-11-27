import { expect, it } from "vitest";
import {
  timelineRows,
  nextTimelineRow,
  flightDuration,
  pointUtcOffset,
  timelinePoint,
  stayNights,
} from "../src/model/timeline";
import type { Entry } from "../src/app/TravelWorkspace";
it("orders a planned hotel arrival after a boat and falls back to its booking time when cleared", () => {
  const point = {date:"2030-12-01",time:"14:00:00",utcOffset:"+07:00",timeZone:"Asia/Bangkok",role:"CHECK_IN",timeMeaning:"NOT_BEFORE",timelineTime:"17:00:00",timelineUtcOffset:"+07:00"} as Entry["points"][number];
  const stay = {id:"stay",type:"HOTEL",points:[point,{...point,role:"CHECK_OUT",date:"2030-12-03",timelineTime:null,timelineUtcOffset:null}]} as Entry;
  const boat = {id:"boat",type:"BOAT",points:[{...point,role:"DEPARTURE",time:"15:00:00",timeMeaning:"EXACT"},{...point,role:"ARRIVAL",time:"16:15:00",timeMeaning:"EXACT"}]} as Entry;
  expect(timelineRows([stay,boat]).map(r=>r.entry.id)).toEqual(["boat","stay","stay"]);
  expect(timelinePoint(point).time).toBe("17:00:00");
  expect(timelinePoint({...point,timelineTime:null,timelineUtcOffset:null}).time).toBe("14:00:00");
  expect(point.time).toBe("14:00:00");
  expect(stayNights(stay)).toBe(2);
  expect(stayNights({...stay,points:[{...point,date:"2026-03-28"},{...point,role:"CHECK_OUT",date:"2026-03-30"}]})).toBe(2);
});
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

it("uses each station's validated seasonal offset and leaves unknown times unguessed", () => {
  const point = {
    time: "10:00:00",
    timeZone: "Europe/Berlin",
    utcOffset: "+01:00",
  } as Entry["points"][number];
  expect(pointUtcOffset(point)).toBe("UTC+01:00");
  expect(pointUtcOffset({ ...point, utcOffset: "+02:00" })).toBe("UTC+02:00");
  expect(pointUtcOffset({ ...point, utcOffset: "Z" })).toBe("UTC+00:00");
  expect(pointUtcOffset({ ...point, time: null, utcOffset: null })).toBeNull();
});

it("keeps compact offsets precise for whole, half and quarter hours", () => {
  const point = { time: "10:00:00", utcOffset: "+04:00" } as Entry["points"][number];
  expect(pointUtcOffset(point, true)).toBe("UTC+4");
  expect(pointUtcOffset({ ...point, utcOffset: "-03:30" }, true)).toBe("UTC-3:30");
  expect(pointUtcOffset({ ...point, utcOffset: "+05:45" }, true)).toBe("UTC+5:45");
  expect(pointUtcOffset({ ...point, utcOffset: "Z" }, true)).toBe("UTC+0");
});
