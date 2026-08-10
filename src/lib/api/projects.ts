import { api } from "./api";
import {Page} from "@/lib/api/types";

export interface Project {
    id: number;
    path: string;
    title: string | null;
    description: string | null;
}

export const projectsApi = {

    getAll() {
        return api.post<Page<Project>>("/projects", {page:0, pageSize: 50});
    },

    get(id: number) {
        return api.get<Project>(`/projects/${id}`);
    },

};