"use client";

import {useQuery} from "@tanstack/react-query";
import {catalogQuery} from "../services/queries";
import {useState} from "react";
import Link from "next/link";
import {useI18n} from "@oskar-lab/i18n/I18nProvider";
import {type Exercise} from "../model/workout";
import ExerciseTracking from "./ExerciseTracking";
import styles from "./Workout.module.css";
/** Offers direct catalog-based tracking without a plan or prescription. */
export default function ExerciseCatalog({exerciseId}: {exerciseId?: string}) {
    const {t, locale} = useI18n();
    const [query, setQuery] = useState("");
    const result = useQuery(catalogQuery());
    const catalog = result.data ?? [];
    const loading = result.isPending;
    const error = result.isError;
    const exercise = catalog.find(item => item.id === exerciseId);
    const name = (item: Exercise) => locale === "de" ? item.nameDe : item.name;
    const filtered = catalog.filter(item => name(item).toLocaleLowerCase(locale).includes(query.toLocaleLowerCase(locale).trim()));
    return <main className={`${styles.page} ${styles.sessionPage}`}>
        {loading ? <p role="status">{t(result.isPaused ? "query.waitingConnection" : "workout.loading")}</p> : error ? <div role="alert"><p>{t("workout.unavailable")}</p>
            <button onClick={() => void result.refetch()}>{t("workout.retry")}</button></div>
            : exerciseId ? exercise ? <><h1 className={styles.focusTitle}>{name(exercise)}</h1><ExerciseTracking exercise={exercise} /></>
                : <p role="alert">{t("workout.exerciseMissing")}</p>
            : <><h1 className={styles.focusTitle}>{t("workout.trackIndependent")}</h1>
                <label className={styles.catalogSearch}>{t("workout.findExercise")}<input type="search" value={query} onChange={event => setQuery(event.target.value)} /></label>
                {!filtered.length && <p>{t("workout.noExercises")}</p>}
                <ul className={`${styles.exerciseLinks} ${styles.catalogLinks}`}>{filtered.map(item => <li key={item.id}><Link href={`/exercises/${item.id}`}>
                    <span className={styles.exerciseName}>{name(item)}</span><span aria-hidden="true">›</span>
                </Link></li>)}</ul>
            </>}
    </main>;
}
