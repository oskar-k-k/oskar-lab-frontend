"use client";

import Link from "next/link";
import ExerciseTracking from "./ExerciseTracking";
import Tabs from "@oskar-lab/ui/Tabs/Tabs";
import {useI18n} from "@oskar-lab/i18n/I18nProvider";
import type {Entry, Exercise, Plan} from "../model/workout";
import {trackingMode} from "../model/tracking";
import {supersetPositions} from "../model/supersets";
import styles from "./Workout.module.css";

const range = (min: number, max: number) => min === max ? `${min}` : `${min}–${max}`;

/** Renders either the minimal session list or one complete exercise prescription. */
export default function SessionView({plan, catalog, exercisePosition, canEdit, onEdit}: {
    plan: Plan; catalog: Exercise[]; exercisePosition?: number; canEdit: boolean; onEdit: () => void;
}) {
    const {t, locale} = useI18n();
    const name = (entry: Entry) => catalog.find(exercise => exercise.id === entry.exerciseId)?.[locale === "de" ? "nameDe" : "name"];
    function duration(min: number, max: number) {
        return min > 0 && min % 60 === 0 && max % 60 === 0
            ? `${range(min / 60, max / 60)} ${t("workout.minutesShort")}`
            : `${range(min, max)} ${t("workout.secondsShort")}`;
    }
    function prescription(entry: Entry) {
        const sets = range(entry.setsMin, entry.setsMax);
        if (entry.targetMin === null || entry.targetMax === null) return `${sets} ${t(entry.setsMax === 1 ? "workout.oneSet" : "workout.sets")}`;
        const target = entry.mode === "seconds" ? duration(entry.targetMin, entry.targetMax) : `${range(entry.targetMin, entry.targetMax)} ${t("workout.reps")}`;
        return entry.mode === "seconds" && entry.setsMax === 1 ? target : `${sets} × ${target}`;
    }
    if (exercisePosition !== undefined) {
        const entry = plan.exercises[exercisePosition];
        if (!entry) return <p role="alert">{t("workout.exerciseMissing")}</p>;
        const positions = supersetPositions(plan.exercises, exercisePosition);
        return <article className={styles.exerciseFocus}>
            <h1 className={styles.screenReaderOnly}>{t("workout.exerciseDetails")}</h1>
            {positions.length > 1 && <p className={styles.supersetCaption}>{t("workout.group", {group: entry.superset})}</p>}
            <Tabs key={`${plan.id}:${exercisePosition}`} label={t("workout.exerciseDetails")} defaultValue={String(exercisePosition)}
                items={positions.map(position => {
                    const entry = plan.exercises[position];
                    return {id: String(position), label: name(entry) ?? "", content: <>
                        <h2 className={styles.focusTitle}>{name(entry)}</h2>
                        <dl className={styles.facts}>
                            <div><dt>{t("workout.sets")}</dt><dd>{range(entry.setsMin, entry.setsMax)}</dd></div>
                            {entry.mode !== "unspecified" && <div><dt>{t(entry.mode === "seconds" ? "workout.duration" : "workout.reps")}</dt><dd>{entry.targetMin !== null && entry.targetMax !== null ? (entry.mode === "seconds" ? duration(entry.targetMin, entry.targetMax) : range(entry.targetMin, entry.targetMax)) : t("workout.open")}</dd></div>}
                            <div><dt>{t("workout.rest")}</dt><dd>{entry.restMin !== null && entry.restMax !== null ? duration(entry.restMin, entry.restMax) : t("workout.open")}</dd></div>
                        </dl>
                        {entry.notes && <section className={styles.focusNotes}><h2>{t("workout.exerciseNotes")}</h2><p>{entry.notes}</p></section>}
                        <ExerciseTracking exercise={catalog.find(exercise => exercise.id === entry.exerciseId)!} initialSets={entry.setsMax} initialMode={trackingMode(entry)} />
                        </>};
                })} />
        </article>;
    }
    return <section className={styles.detail} aria-label={plan.name}>
        <div className={styles.minimalTitle}>
            <h1>{plan.name}</h1>
            {canEdit && <button type="button" onClick={onEdit} aria-label={t(plan.template ? "workout.useTemplate" : "workout.edit")}>{t("workout.customize")}</button>}
        </div>
        <ol className={styles.exerciseLinks}>{plan.exercises.map((entry, index) => {
            const related = supersetPositions(plan.exercises, index);
            const grouped = related.length > 1;
            const starts = grouped && plan.exercises[index - 1]?.superset !== entry.superset;
            const ends = grouped && plan.exercises[index + 1]?.superset !== entry.superset;
            return <li key={index} className={grouped ? `${styles.supersetRow} ${starts ? styles.supersetStart : ""} ${ends ? styles.supersetEnd : ""}` : undefined}>
            {starts && <p id={`superset-${index}`} className={styles.supersetCaption}>{t("workout.group", {group: entry.superset})}</p>}
            <Link href={`/sessions/${plan.id}/exercises/${index}`} aria-describedby={grouped ? `superset-${related[0]}` : undefined}>
                <span className={styles.position} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <span className={styles.exerciseLabel}><span className={styles.exerciseName}>{name(entry)}</span><span className={styles.prescription}>{prescription(entry)}</span></span>
                <span aria-hidden="true" className={styles.chevron}>›</span>
            </Link>
        </li>;
        })}</ol>
        {plan.notes && <details className={styles.planNotes}><summary>{t("workout.planNotes")}</summary><p className={styles.muted}>{plan.notes}</p></details>}
    </section>;
}
