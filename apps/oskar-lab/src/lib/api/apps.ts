import {createBackendClient} from "@oskar-lab/api/client";
import type {components} from "@oskar-lab/api/backend";
import {ApiError} from "./api";
import {Page} from "@/lib/api/types";

/** Catalog fields used by the platform, plus its local thumbnail override. */
export type App = Pick<components["schemas"]["AppEntity"], "id" | "path" | "title" | "description"> & {thumbnail?: string};

function client() {
    return createBackendClient({baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:10081"});
}

function isApp(value: unknown): value is App {
    if (typeof value !== "object" || value === null) return false;
    const app = value as Record<string, unknown>;
    return (
        typeof app.id === "number" &&
        typeof app.path === "string" &&
        (typeof app.title === "string" || app.title === null) &&
        (typeof app.description === "string" || app.description === null)
    );
}

/** Validates the app list received at the HTTP boundary. */
export function isAppPage(value: unknown): value is Page<App> {
    if (typeof value !== "object" || value === null) return false;
    const page = value as Record<string, unknown>;
    return (
        Array.isArray(page.content) && page.content.every(isApp) &&
        typeof page.totalPages === "number" &&
        typeof page.totalElements === "number" &&
        typeof page.size === "number" &&
        typeof page.number === "number"
    );
}

export const appsApi = {

    async getAll(): Promise<Page<App>> {
        const {data: response, response: http} = await client().POST("/apps", {body: {page: 0, pageSize: 50}, signal: AbortSignal.timeout(5000)});
        if (!http.ok) throw new ApiError(http.status, http.statusText);
        if (!isAppPage(response)) throw new TypeError("The apps API returned an invalid page.");
        return response;
    },

    async get(id: number): Promise<App> {
        const {data: app, response} = await client().GET("/apps/{id}", {params: {path: {id}}, signal: AbortSignal.timeout(5000)});
        if (!response.ok) throw new ApiError(response.status, response.statusText);
        if (!isApp(app)) throw new TypeError("The apps API returned an invalid app.");
        return app;
    },

};
