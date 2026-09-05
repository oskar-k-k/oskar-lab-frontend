"use client";

import {useMemo, useState} from "react";
import Card from "@/components/Cards/Card";
import Grid from "@/components/Grids/Grid";
import Header from "@/components/Header/Header";
import StandardLayout from "@/components/Layouts/StandardLayout";
import Search from "@/components/Search/Search";
import type {Project} from "@/lib/api/projects";
import styles from "./ProjectsExplorer.module.css";
import {useI18n} from "@/lib/i18n/I18nProvider";

/** Displays and filters all available Oskar Lab projects. */
export default function ProjectsExplorer({projects, backendAvailable}: Readonly<{projects: readonly Project[]; backendAvailable: boolean}>) {
    const [query, setQuery] = useState("");
    const {t} = useI18n();
    const localizedProjects = useMemo(() => projects.map(project => ({
        ...project,
        description: project.path === "portfolio" ? t("projects.portfolioDescription") : project.path === "core" ? t("projects.coreDescription") : project.path === "chess" ? t("projects.chessDescription") : project.description,
    })), [projects, t]);
    const visibleProjects = useMemo(() => {
        const normalizedQuery = query.trim().toLocaleLowerCase("de");
        if (!normalizedQuery) return localizedProjects;
        return localizedProjects.filter(project => [project.title, project.description, project.path]
            .some(value => value?.toLocaleLowerCase("de").includes(normalizedQuery)));
    }, [localizedProjects, query]);

    return (
        <div className={styles.page}>
            <div className={styles.ambient} aria-hidden="true" />
            <Header
                projectName={t("common.projects")}
                center={<Search value={query} onChange={setQuery} resultCount={visibleProjects.length} label={t("projects.searchLabel")} placeholder={t("projects.searchPlaceholder")} />}
                status={!backendAvailable ? t("projects.backendUnavailableShort") : undefined}
                statusLabel={!backendAvailable ? t("projects.backendUnavailable") : undefined}
            />
            <StandardLayout>
                <main className={styles.content}>
                    {query && <p className={styles.resultSummary}>{visibleProjects.length} {t(visibleProjects.length === 1 ? "projects.projectFound" : "projects.projectsFound")}</p>}
                    {visibleProjects.length > 0 ? (
                        <Grid className={styles.projectGrid} cardWidth={280}>
                            {visibleProjects.map(project => (
                                <Card
                                    key={project.id}
                                    title={project.title ?? ""}
                                    description={project.description ?? ""}
                                    href={`/projects/${project.path}`}
                                    image={project.thumbnail ?? `/projects/${project.path}/thumbnail.png`}
                                    imageAspect="square"
                                    className={project.path === "portfolio" ? styles.portfolioCard : styles.projectCard}
                                />
                            ))}
                        </Grid>
                    ) : (
                        <section className={styles.empty}>
                            <h1>{t("projects.emptyTitle")}</h1>
                            <p>{t("projects.emptyDescription")}</p>
                            <button type="button" onClick={() => setQuery("")}>{t("common.clearSearch")}</button>
                        </section>
                    )}
                </main>
            </StandardLayout>
        </div>
    );
}
