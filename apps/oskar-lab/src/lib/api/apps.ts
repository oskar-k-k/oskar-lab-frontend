import { api } from "./api";
import {Page} from "@/lib/api/types";

export interface App {
    id: number;
    path: string;
    title: string | null;
    description: string | null;
    thumbnail?: string;
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
        const response: unknown = await api.post("/apps", {page: 0, pageSize: 50});
        if (!isAppPage(response)) throw new TypeError("The apps API returned an invalid page.");
        return response;
    },

    async get(id: number): Promise<App> {
        const app: unknown = await api.get(`/apps/${id}`);
        if (!isApp(app)) throw new TypeError("The apps API returned an invalid app.");
        return app;
    },

};
