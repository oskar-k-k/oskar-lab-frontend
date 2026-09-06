import {Project, projectsApi} from "@/lib/api/projects";
import ProjectsExplorer from "./ProjectsExplorer";

export const dynamic = "force-dynamic";

const localProjects: Project[] = [
    {
        id: -3,
        path: "portfolio",
        title: "Portfolio",
        description: "Software, ideas, and the person behind Oskar Lab.",
        thumbnail: "/projects/portfolio/oskar.jpg",
    },
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
    {
        id: -4,
        path: "cloth-lab",
        title: "ClothLab",
        description: "A self-hosted AI fitting room prototype for person and garment images.",
        thumbnail: "/projects/virtual-try-on/thumbnail.svg",
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
