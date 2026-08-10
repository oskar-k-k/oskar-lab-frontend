import Image from "next/image";
import Button from "@/components/Buttons/Button";
import Grid from "@/components/Grids/Grid";
import Card from "@/components/Cards/Card"
import { projectsApi } from "@/lib/api/projects";
import StandardLayout from "@/components/Layouts/StandardLayout";

const projects = await projectsApi.getAll();

export default function Home() {
  return (
        <Grid>
            {projects.content.map((project) => (
                <Card
                    title={project.title ?? ""}
                    description={project.description ?? ""}
                    href={`/projects/${project.path}`}
                    image={`/projects/${project.path}/thumbnail.png`}
                />
            ))}
        </Grid>
  );
}
