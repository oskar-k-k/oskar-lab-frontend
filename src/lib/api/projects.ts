import { api } from "./api";
import {Page} from "@/lib/api/types";

export interface Project {
    id: number;
    path: string;
    title: string | null;
    description: string | null;
    thumbnail?: string;
}

function isProject(value: unknown): value is Project {
    if (typeof value !== "object" || value === null) return false;
    const project = value as Record<string, unknown>;
    return (
        typeof project.id === "number" &&
        typeof project.path === "string" &&
        (typeof project.title === "string" || project.title === null) &&
        (typeof project.description === "string" || project.description === null)
    );
}

/** Validates the project list received at the HTTP boundary. */
export function isProjectPage(value: unknown): value is Page<Project> {
    if (typeof value !== "object" || value === null) return false;
    const page = value as Record<string, unknown>;
    return (
        Array.isArray(page.content) && page.content.every(isProject) &&
        typeof page.totalPages === "number" &&
        typeof page.totalElements === "number" &&
        typeof page.size === "number" &&
        typeof page.number === "number"
    );
}

export const projectsApi = {

    async getAll(): Promise<Page<Project>> {
        const response: unknown = await api.post("/projects", {page: 0, pageSize: 50});
        if (!isProjectPage(response)) throw new TypeError("The projects API returned an invalid page.");
        return response;
    },

    async get(id: number): Promise<Project> {
        const project: unknown = await api.get(`/projects/${id}`);
        if (!isProject(project)) throw new TypeError("The projects API returned an invalid project.");
        return project;
    },

};
