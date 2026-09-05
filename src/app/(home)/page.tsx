import {Project, projectsApi} from "@/lib/api/projects";
import ProjectsExplorer from "./ProjectsExplorer";

export const dynamic = "force-dynamic";

const localProjects: Project[] = [
    {
        id: -2,
        path: "core",
        title: "Core & Design",
        description: "Der lebende Styleguide für UI-Komponenten, Design-Tokens und Core-Helfer.",
        thumbnail: "/projects/core/thumbnail.svg",
    },
    {
        id: -1,
        path: "chess",
        title: "Chess",
        description: "Ein vollständiges Schachspiel mit allen wichtigen Regeln.",
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
