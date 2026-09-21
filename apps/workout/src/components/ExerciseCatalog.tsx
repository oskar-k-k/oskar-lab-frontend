"use client";

import {useEffect, useState} from "react";
import Link from "next/link";
import {useI18n} from "@oskar-lab/i18n/I18nProvider";
import {isExercise, type Exercise} from "../model/workout";
import {request} from "../services/client";
import ExerciseTracking from "./ExerciseTracking";
import styles from "./Workout.module.css";

const isCatalog = (value: unknown): value is Exercise[] => Array.isArray(value) && value.every(isExercise);

/** Offers direct catalog-based tracking without a plan or prescription. */
export default function ExerciseCatalog({exerciseId}: {exerciseId?: string}) {
    const {t, locale} = useI18n();
    const [catalog, setCatalog] = useState<Exercise[]>([]);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [retry, setRetry] = useState(0);
    useEffect(() => {
        let active = true;
        request("exercises", isCatalog).then(data => {if (active) {setCatalog(data); setError(false);}})
            .catch(() => {if (active) setError(true);})
            .finally(() => {if (active) setLoading(false);});
        return () => {active = false;};
    }, [retry]);
    const exercise = catalog.find(item => item.id === exerciseId);
    const name = (item: Exercise) => locale === "de" ? item.nameDe : item.name;
    const filtered = catalog.filter(item => name(item).toLocaleLowerCase(locale).includes(query.toLocaleLowerCase(locale).trim()));
    return <main className={`${styles.page} ${styles.sessionPage}`}>
        {loading ? <p role="status">{t("workout.loading")}</p> : error ? <div role="alert"><p>{t("workout.unavailable")}</p>
            <button onClick={() => {setLoading(true); setRetry(value => value + 1);}}>{t("workout.retry")}</button></div>
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
