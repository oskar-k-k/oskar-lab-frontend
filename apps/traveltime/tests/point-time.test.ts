import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import { bookingTimeMeaning, editedUtcOffset, plannedTimeLabel } from "../src/model/point-time";
import { timelinePoint, timelineRows } from "../src/model/timeline";
import type { Entry } from "../src/app/TravelWorkspace";
vi.mock("@oskar-lab/i18n/I18nProvider", () => ({ useI18n: () => ({ locale: "en", t: (key: string) => key }) }));
import BookingForm from "../src/app/BookingForm";
import TravelTimeline from "../src/app/TravelTimeline";

const departure = { role: "DEPARTURE", date: "2030-12-02", time: "01:00:00", timeZone: "Europe/Berlin", utcOffset: "+01:00", timeMeaning: "EXACT", placeName: "Example airport", address: "", mapEmbedUrl: null, timelineDate: "2030-12-01", timelineTime: "22:00:00", timelineUtcOffset: "+01:00" } as Entry["points"][number];
const flight = { id: "flight", type: "FLIGHT", title: "Example flight", points: [departure, { ...departure, role: "ARRIVAL", date: "2030-12-02", time: "07:00:00", timelineTime: null, timelineDate: null, timelineUtcOffset: null }], durationMinutes: 360 } as Entry;

it("sorts by a separately planned date and falls back to booked instants when plans are cleared", () => {
  const activity = { id: "activity", type: "ACTIVITY", points: [{ ...departure, role: "START", date: "2030-12-01", time: "23:00:00", timelineTime: null, timelineDate: null, timelineUtcOffset: null }] } as Entry;
  expect(timelineRows([activity, flight]).map(row => row.entry.id)).toEqual(["flight", "activity"]);
  expect(timelinePoint(departure)).toMatchObject({ date: "2030-12-01", time: "22:00:00" });
  expect(timelinePoint({ ...departure, timelineTime: null, timelineDate: null, timelineUtcOffset: null })).toMatchObject({ date: "2030-12-02", time: "01:00:00" });
  expect(departure.time).toBe("01:00:00");
});

it("derives booking meanings and retains offsets only while the original local clock is unchanged", () => {
  expect(bookingTimeMeaning("CHECK_IN", "14:00")).toBe("NOT_BEFORE");
  expect(bookingTimeMeaning("CHECK_OUT", "11:00")).toBe("NOT_AFTER");
  expect(bookingTimeMeaning("DEPARTURE", "10:00")).toBe("EXACT");
  expect(bookingTimeMeaning("START", null)).toBe("UNSPECIFIED");
  expect(editedUtcOffset(departure, departure.date, "01:00", departure.timeZone, "")).toBe("+01:00");
  expect(editedUtcOffset(departure, "2030-06-01", "01:00", departure.timeZone, "")).toBeNull();
  expect(editedUtcOffset(departure, departure.date, "01:00", "Asia/Bangkok", "")).toBeNull();
  expect(plannedTimeLabel("FLIGHT", "DEPARTURE")).toBe("airportArrival");
  expect(plannedTimeLabel("BOAT", "DEPARTURE")).toBe("pierArrival");
});

it.each(["FLIGHT", "BOAT", "HOTEL", "ACTIVITY"] as const)("offers an independent plan for %s without a time-details selector", type => {
  const roles = type === "HOTEL" ? ["CHECK_IN", "CHECK_OUT"] : type === "ACTIVITY" ? ["START"] : ["DEPARTURE", "ARRIVAL"];
  const entry = { ...flight, type, points: roles.map(role => ({ ...departure, role })) } as Entry;
  const html = renderToStaticMarkup(createElement(BookingForm, { entry, startDate: departure.date, busy: false, onSave: vi.fn(), onCancel: vi.fn() }));
  expect(html).not.toContain("travel.meaning");
  expect(html).not.toContain('name="meaning0"');
  expect(html).toContain('name="timeline0"');
  expect(html).toContain('name="timelineDate0"');
  expect(html).toContain('name="time0"');
});

it("labels planned airport presence and the booked departure separately while preserving flight duration", () => {
  const html = renderToStaticMarkup(createElement(TravelTimeline, { entries: [flight], now: 0, loading: false, editable: false, disabled: false, onDocuments: vi.fn(), onEdit: vi.fn(), onDelete: vi.fn() }));
  expect(html).toContain("travel.airportArrival");
  expect(html).toContain("22:00 (UTC+1)");
  expect(html).toContain("01:00");
  expect(html).toContain("6 hr");
});
