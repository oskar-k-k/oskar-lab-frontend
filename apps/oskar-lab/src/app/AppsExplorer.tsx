"use client";

import {useQuery} from "@tanstack/react-query";
import {catalogQuery} from "../lib/api/catalogQuery";
import {useMemo, useState} from "react";
import Card from "@oskar-lab/ui/Cards/Card";
import Grid from "@oskar-lab/ui/Grids/Grid";
import Header from "@oskar-lab/platform-shell/Header/Header";
import StandardLayout from "@oskar-lab/ui/Layouts/StandardLayout";
import Search from "@oskar-lab/ui/Search/Search";
import type {App} from "@/lib/api/apps";
import styles from "./AppsExplorer.module.css";
import {useI18n} from "@oskar-lab/i18n/I18nProvider";

/** Displays and filters all available Oskar Lab apps. */
export default function AppsExplorer({localApps, initialRemoteApps, backendAvailable: initialAvailable, fetchedAt}: Readonly<{
    localApps: readonly App[]; initialRemoteApps: App[]; backendAvailable: boolean; fetchedAt: number;
}>) {
    const catalog = useQuery({...catalogQuery(), initialData: initialAvailable ? initialRemoteApps : undefined, initialDataUpdatedAt: fetchedAt});
    const backendAvailable = !catalog.isError && catalog.data !== undefined;
    const apps = useMemo(() => [...localApps, ...(catalog.data ?? []).filter(app => !localApps.some(local => local.path === app.path))], [localApps, catalog.data]);
    const [query, setQuery] = useState("");
    const {t} = useI18n();
    const localizedApps = useMemo(() => apps.map(app => ({
        ...app,
        description: app.path === "inside-llm" ? t("llm.description") : app.path === "2d-lab" ? t("scene2d.description") : app.path === "room-studio" ? t("room.subtitle") : app.path === "workout" ? t("apps.workoutDescription") : app.path === "portfolio" ? t("apps.portfolioDescription") : app.path === "core-design" ? t("apps.coreDescription") : app.path === "chess" ? t("apps.chessDescription") : app.path === "cloth-lab" ? t("apps.virtualTryOnDescription") : app.path === "neon-vault" ? t("apps.neonVaultDescription") : app.description,
    })), [apps, t]);
    const visibleApps = useMemo(() => {
        const normalizedQuery = query.trim().toLocaleLowerCase("de");
        if (!normalizedQuery) return localizedApps;
        return localizedApps.filter(app => [app.title, app.description, app.path]
            .some(value => value?.toLocaleLowerCase("de").includes(normalizedQuery)));
    }, [localizedApps, query]);

    return (
        <div className={styles.page}>
            <div className={styles.ambient} aria-hidden="true" />
            <Header
                appName={t("common.apps")}
                center={<Search value={query} onChange={setQuery} resultCount={visibleApps.length} label={t("apps.searchLabel")} placeholder={t("apps.searchPlaceholder")} />}
                status={!backendAvailable ? t("apps.backendUnavailableShort") : undefined}
                statusLabel={!backendAvailable ? t("apps.backendUnavailable") : undefined}
            />
            <StandardLayout>
                <main className={styles.content}>
                    {query && <p className={styles.resultSummary}>{visibleApps.length} {t(visibleApps.length === 1 ? "apps.appFound" : "apps.appsFound")}</p>}
                    {visibleApps.length > 0 ? (
                        <Grid className={styles.projectGrid} cardWidth={280}>
                            {visibleApps.map(app => (
                                <Card
                                    key={app.id}
                                    title={app.title ?? ""}
                                    description={app.description ?? ""}
                                    href={`/apps/${app.path}`}
                                    image={app.thumbnail ?? `/catalog/${app.path}/thumbnail.png`}
                                    imageAspect="square"
                                    className={app.path === "portfolio" ? styles.portfolioCard : styles.projectCard}
                                />
                            ))}
                        </Grid>
                    ) : (
                        <section className={styles.empty}>
                            <h1>{t("apps.emptyTitle")}</h1>
                            <p>{t("apps.emptyDescription")}</p>
                            <button type="button" onClick={() => setQuery("")}>{t("common.clearSearch")}</button>
                        </section>
                    )}
                </main>
            </StandardLayout>
        </div>
    );
}
