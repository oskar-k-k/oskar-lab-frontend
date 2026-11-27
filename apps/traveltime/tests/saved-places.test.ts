import { expect, it } from "vitest";
import { safeSavedUrl, validSavedPlace } from "../src/model/saved-places";
import { validTravelResponse } from "../src/model/contracts";
const id = "11111111-1111-4111-8111-111111111111";
const place = { id, tripId: id, title: "Example inspiration", url: "https://www.instagram.com/reel/example/", notes: "Example", version: 0 };
it("accepts optional web links and rejects active schemes, credentials and malformed URLs", () => {
  for (const url of ["", place.url, "https://example.invalid/place?q=a%20b"]) expect(safeSavedUrl(url)).toBe(true);
  for (const url of ["javascript:alert(1)", "file:///tmp/private", "https://user:password@example.invalid/", "https:example.invalid", "https://example.invalid/a b", "https://example.invalid/\\x"]) expect(safeSavedUrl(url)).toBe(false);
});
it("validates each bounded saved-place response before rendering links", () => {
  expect(validSavedPlace(place)).toBe(true);
  expect(validSavedPlace({ ...place, version: -1 })).toBe(false);
  expect(validSavedPlace({ ...place, url: "javascript:alert(1)" })).toBe(false);
  expect(validTravelResponse(`/${id}/saved`, "GET", { places: [place], hasMore: false })).toBe(true);
  expect(validTravelResponse(`/${id}/saved`, "GET", { places: Array(21).fill(place), hasMore: true })).toBe(false);
  expect(validTravelResponse(`/${id}/saved`, "POST", place)).toBe(true);
});
