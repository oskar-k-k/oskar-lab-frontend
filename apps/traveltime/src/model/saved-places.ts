import type { components } from "@oskar-lab/api/backend";
export type SavedPlace = components["schemas"]["TravelSavedPlace"];
export type SavedPlacePage = components["schemas"]["TravelSavedPlacePage"];

/** Allows optional web links without credentials or active schemes; never fetches them. */
export function safeSavedUrl(value: string): boolean {
  if (!value) return true;
  if (value.length > 2048 || !/^https?:\/\//i.test(value) || /[\u0000-\u0020\\]/.test(value)) return false;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) && Boolean(url.hostname) && !url.username && !url.password;
  } catch { return false; }
}

/** Validates private saved-place responses before URLs or content enter UI state. */
export function validSavedPlace(value: unknown): value is SavedPlace {
  if (!value || typeof value !== "object") return false;
  const place = value as Record<string, unknown>;
  const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
  return typeof place.id === "string" && uuid.test(place.id) && typeof place.tripId === "string" && uuid.test(place.tripId) &&
    typeof place.title === "string" && Boolean(place.title.trim()) && place.title.length <= 160 &&
    typeof place.url === "string" && safeSavedUrl(place.url) && typeof place.notes === "string" && place.notes.length <= 1000 &&
    Number.isSafeInteger(place.version) && Number(place.version) >= 0;
}
