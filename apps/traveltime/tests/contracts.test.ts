import { expect, it } from "vitest";
import { validTravelResponse } from "../src/model/contracts";
const id = "11111111-1111-4111-8111-111111111111";
const trip = {
  id,
  ownerId: id,
  title: "Example",
  notes: "",
  startDate: "2030-12-01",
  endDate: "2030-12-10",
  version: 0,
  canEdit: true,
};
it("rejects malformed dates, missing permission flags and unsafe versions at the response boundary", () => {
  expect(
    validTravelResponse("", "GET", { trips: [trip], hasMore: false }),
  ).toBe(true);
  for (const invalid of [
    { startDate: "2030-02-30" },
    { canEdit: "true" },
    { notes: null },
    { version: -1 },
  ])
    expect(validTravelResponse("/" + id, "GET", { ...trip, ...invalid })).toBe(
      false,
    );
});
it("validates every entry and requires a recognized time zone before rendering", () => {
  const point = {
    role: "START",
    date: "2030-12-01",
    time: null,
    timeZone: "Asia/Bangkok",
    utcOffset: null,
    timeMeaning: "UNSPECIFIED",
    placeName: "Example",
    address: "",
  };
  const entry = {
    id,
    tripId: id,
    type: "ACTIVITY",
    title: "Example",
    notes: "",
    reference: "",
    version: 0,
    points: [point],
    durationMinutes: null,
  };
  expect(
    validTravelResponse(`/${id}/entries`, "GET", {
      entries: [entry],
      hasMore: false,
    }),
  ).toBe(true);
  expect(
    validTravelResponse(`/${id}/entries`, "GET", {
      entries: [{ ...entry, points: [{ ...point, timeZone: "Not/AZone" }] }],
      hasMore: false,
    }),
  ).toBe(false);
});
