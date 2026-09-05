"use client";

import {useMemo, useState} from "react";
import Card from "@/components/Cards/Card";
import Grid from "@/components/Grids/Grid";
import Header from "@/components/Header/Header";
import StandardLayout from "@/components/Layouts/StandardLayout";
import Search from "@/components/Search/Search";
import type {Project} from "@/lib/api/projects";
import styles from "./ProjectsExplorer.module.css";

/** Displays and filters all available Oskar Lab projects. */
export default function ProjectsExplorer({projects, backendAvailable}: Readonly<{projects: readonly Project[]; backendAvailable: boolean}>) {
    const [query, setQuery] = useState("");
    const visibleProjects = useMemo(() => {
        const normalizedQuery = query.trim().toLocaleLowerCase("de");
        if (!normalizedQuery) return projects;
        return projects.filter(project => [project.title, project.description, project.path]
            .some(value => value?.toLocaleLowerCase("de").includes(normalizedQuery)));
    }, [projects, query]);

    return <>
        <Header projectName="Projects" center={<Search value={query} onChange={setQuery} resultCount={visibleProjects.length} label="Projekte durchsuchen" placeholder="Projekte durchsuchen …" />} />
        <StandardLayout>
            {!backendAvailable && <p role="status" className={styles.warning}>Das Backend ist gerade nicht erreichbar. Lokale Projekte bleiben weiterhin verfügbar.</p>}
            {query && <p className={styles.resultSummary}>{visibleProjects.length} {visibleProjects.length === 1 ? "Projekt" : "Projekte"} gefunden</p>}
            {visibleProjects.length > 0 ? <Grid>{visibleProjects.map(project => <Card key={project.id} title={project.title ?? ""} description={project.description ?? ""} href={`/projects/${project.path}`} image={project.thumbnail ?? `/projects/${project.path}/thumbnail.png`} />)}</Grid> : <section className={styles.empty}><h1>Kein Projekt gefunden</h1><p>Versuche einen anderen Suchbegriff oder lösche die Suche.</p><button type="button" onClick={() => setQuery("")}>Suche löschen</button></section>}
        </StandardLayout>
    </>;
}
