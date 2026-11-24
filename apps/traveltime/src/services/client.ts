import { validTravelResponse } from "../model/contracts";
import { appPath } from "@oskar-lab/config/paths";
/** Safe API failure for localized user feedback. */
export class TravelError extends Error {
  constructor(
    public status: number,
    public code: string,
  ) {
    super(code);
  }
}
/** Calls the same-origin travel adapter without exposing backend credentials or retrying writes. */
export async function travelRequest<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(appPath("/api/travel" + path), {
      method,
      body:
        body instanceof FormData
          ? body
          : body === undefined
            ? undefined
            : JSON.stringify(body),
      headers:
        body && !(body instanceof FormData)
          ? { "Content-Type": "application/json" }
          : {},
      cache: "no-store",
      signal: AbortSignal.timeout(50000),
    });
  } catch {
    throw new TravelError(503, "unavailable");
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new TravelError(
      response.status,
      typeof error.code === "string" ? error.code : "unavailable",
    );
  }
  if (response.status === 204) return undefined as T;
  let value: unknown;
  try {
    value = await response.json();
  } catch {
    throw new TravelError(503, "invalidResponse");
  }
  if (!validTravelResponse(path, method, value))
    throw new TravelError(503, "invalidResponse");
  return value as T;
}
