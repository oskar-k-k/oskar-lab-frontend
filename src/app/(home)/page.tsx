import {Project, projectsApi} from "@/lib/api/projects";
import ProjectsExplorer from "./ProjectsExplorer";

export const dynamic = "force-dynamic";

const localProjects: Project[] = [
    {
        id: -2,
        path: "core",
        title: "Core & Design",
        description: "The living style guide for UI components, design tokens, and core utilities.",
        thumbnail: "/projects/core/thumbnail.svg",
    },
    {
        id: -1,
        path: "chess",
        title: "Chess",
        description: "A complete chess game with all important rules.",
    },
];

async function loadProjects(): Promise<{projects: Project[]; backendAvailable: boolean}> {
    try {
        const response = await projectsApi.getAll();
        const remoteOnlyProjects = response.content.filter(remoteProject => (
            !localProjects.some(localProject => localProject.path === remoteProject.path)
        ));

        return {projects: [...localProjects, ...remoteOnlyProjects], backendAvailable: true};
    } catch {
        return {projects: localProjects, backendAvailable: false};
    }
}

export default async function Home() {
    const {projects, backendAvailable} = await loadProjects();
    return <ProjectsExplorer projects={projects} backendAvailable={backendAvailable} />;
}
