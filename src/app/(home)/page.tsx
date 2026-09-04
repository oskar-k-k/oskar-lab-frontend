import Grid from "@/components/Grids/Grid";
import Card from "@/components/Cards/Card"
import {Project, projectsApi} from "@/lib/api/projects";

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

  return (
      <>
        {!backendAvailable && (
            <p role="status" className="mb-6 rounded-xl border border-yellow-accent/40 bg-yellow-accent/10 p-4 text-text-muted">
                Das Backend ist gerade nicht erreichbar. Lokale Projekte bleiben weiterhin verfügbar.
            </p>
        )}

        <Grid>
            {projects.map((project) => (
                <Card
                    key={project.id}
                    title={project.title ?? ""}
                    description={project.description ?? ""}
                    href={`/projects/${project.path}`}
                    image={project.thumbnail ?? `/projects/${project.path}/thumbnail.png`}
                />
            ))}
        </Grid>
      </>
  );
}
