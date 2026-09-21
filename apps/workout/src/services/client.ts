import {appPath} from "@oskar-lab/config/paths";

/** Safe status codes drive localized feedback without exposing server internals. */
export class WorkoutError extends Error {
    constructor(public status: number) { super("Workout request failed"); }
}
/** Uses bounded requests; a failed save leaves the editor draft intact. */
export async function request<T>(path: string, validate: (value: unknown) => value is T, body?: unknown, method = "GET"): Promise<T> {
    let response: Response;
    try {
        response = await fetch(appPath(`/api/workout/${path}`), {
            method, cache: "no-store", signal: AbortSignal.timeout(15000),
            ...(body === undefined ? {} : {headers: {"Content-Type": "application/json"}, body: JSON.stringify(body)}),
        });
    } catch { throw new WorkoutError(503); }
    if (!response.ok) throw new WorkoutError(response.status);
    const data: unknown = await response.json();
    if (!validate(data)) throw new WorkoutError(503);
    return data;
}
