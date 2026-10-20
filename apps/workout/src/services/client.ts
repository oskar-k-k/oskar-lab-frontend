import {appPath} from "@oskar-lab/config/paths";
import {createBrowserClient} from "@oskar-lab/api/client";
import {isPlan} from "../model/workout";
import {isSaveLog} from "../model/tracking";

/** Safe status codes drive localized feedback without exposing server internals. */
export class WorkoutError extends Error {
    constructor(public status: number) { super("Workout request failed"); }
}
/** Uses bounded requests; a failed save leaves the editor draft intact. */
export async function request<T>(path: string, validate: (value: unknown) => value is T, body?: unknown, method = "GET"): Promise<T> {
    for (let attempt = 0; ; attempt++) {
        try { return await send(path, validate, body, method); }
        catch (error) {
            if (method !== "GET" || attempt >= 2 || !(error instanceof WorkoutError) || error.status < 500) throw error;
            await new Promise(resolve => setTimeout(resolve, attempt === 0 ? 500 : 1500));
        }
    }
}

async function send<T>(path: string, validate: (value: unknown) => value is T, body: unknown, method: string): Promise<T> {
    let result;
    try {
        const base = typeof window === "undefined" ? "http://localhost" : window.location.origin;
        const client = createBrowserClient(`${base}${appPath("")}`);
        const url = new URL(path, "http://workout.invalid/");
        const route = url.pathname.slice(1);
        const options = {signal: AbortSignal.timeout(15000)};
        if (method === "GET") {
            const page = Number(url.searchParams.get("page") ?? "0");
            if (route === "exercises") result = await client.GET("/api/workout/exercises", options);
            else if (route === "templates") result = await client.GET("/api/workout/templates", options);
            else if (route === "plans") result = await client.GET("/api/workout/plans", {...options, params: {query: {page}}});
            else if (route.startsWith("plans/")) result = await client.GET("/api/workout/plans/{id}", {...options, params: {path: {id: route.slice(6)}}});
            else if (route.startsWith("history/")) result = await client.GET("/api/workout/history/{exerciseId}", {...options, params: {path: {exerciseId: route.slice(8)}, query: {page}}});
        } else if (method === "POST" && route === "logs" && isSaveLog(body)) {
            result = await client.POST("/api/workout/logs", {...options, body});
        } else if (method === "POST" && route === "plans" && isPlan(body)) {
            result = await client.POST("/api/workout/plans", {...options, body});
        } else if (method === "PUT" && route.startsWith("plans/") && isPlan(body)) {
            result = await client.PUT("/api/workout/plans/{id}", {...options, params: {path: {id: route.slice(6)}}, body});
        }
    } catch { throw new WorkoutError(503); }
    if (!result) throw new WorkoutError(400);
    if (!result.response.ok) throw new WorkoutError(result.response.status);
    const data: unknown = result.data;
    if (!validate(data)) throw new WorkoutError(503);
    return data;
}
