"use client";

import {useEffect, useState} from "react";
import {useCurrentUser} from "@oskar-lab/auth/useCurrentUser";
import {useI18n} from "@oskar-lab/i18n/I18nProvider";
import {appPath} from "@oskar-lab/config/paths";
import type {Exercise} from "../model/workout";
import {completedSets, isExerciseLog, isHistory, isSaveLog, type TrackingMode, type ExerciseLog, type SaveLog, type SetDraft} from "../model/tracking";
import {request, WorkoutError} from "../services/client";
import styles from "./Workout.module.css";

type Props = {exercise: Exercise; initialSets?: number; initialMode?: TrackingMode};
type Draft = {rows: SetDraft[]; pending: SaveLog | null; unit: "reps" | "seconds"; withWeight: boolean};

function readDraft(key: string, count: number, initialMode: TrackingMode): Draft {
    const empty: Draft = {unit: initialMode === "seconds" ? "seconds" : "reps", withWeight: initialMode === "weighted", rows: Array.from({length: count}, () => ({value: "", weight: ""})), pending: null};
    try {
        const value: unknown = JSON.parse(sessionStorage.getItem(key) ?? "null");
        if (!value || typeof value !== "object") return empty;
        const draft = value as Draft;
        if ((draft.unit !== "reps" && draft.unit !== "seconds") || typeof draft.withWeight !== "boolean" || !Array.isArray(draft.rows) || !draft.rows.length || draft.rows.length > 100 ||
            !draft.rows.every(row => row && typeof row.value === "string" && row.value.length <= 20 && typeof row.weight === "string" && row.weight.length <= 20) ||
            (draft.pending !== null && !isSaveLog(draft.pending))) return empty;
        return draft;
    } catch { return empty; }
}

/** Captures actual sets and displays personal history; guests use the central sign-in flow. */
export default function ExerciseTracking(props: Props) {
    const {user} = useCurrentUser();
    const {t} = useI18n();
    if (!user) return <section className={styles.tracking}><p className={styles.muted}>{t("workout.trackingLogin")}</p>
        <a href={`${process.env.NEXT_PUBLIC_PLATFORM_URL ?? ""}/account?returnTo=${encodeURIComponent(appPath(`/exercises/${props.exercise.id}`))}`}>{t("workout.signIn")}</a></section>;
    return <PersonalTracking key={`${user.id}:${props.exercise.id}`} {...props} ownerId={user.id} />;
}

function PersonalTracking({exercise, initialSets = 3, initialMode = "reps", ownerId}: Props & {ownerId: string}) {
    const {t, locale} = useI18n();
    const storageKey = `exercise-draft:${ownerId}:${exercise.id}`;
    const [draft, setDraft] = useState(() => readDraft(storageKey, initialSets, initialMode));
    const {unit, withWeight} = draft;
    const [busy, setBusy] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<number | null>(null);
    const [history, setHistory] = useState<ExerciseLog[]>([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [historyError, setHistoryError] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [page, setPage] = useState(0);
    const [reload, setReload] = useState(0);
    const dirty = draft.rows.some(row => row.value !== "" || row.weight !== "");
    useEffect(() => {
        try {
            if (dirty || draft.pending) sessionStorage.setItem(storageKey, JSON.stringify(draft));
            else sessionStorage.removeItem(storageKey);
        } catch { /* Storage may be unavailable; in-memory drafts still survive failed requests. */ }
        if (!dirty && !draft.pending) return;
        const prevent = (event: BeforeUnloadEvent) => event.preventDefault();
        window.addEventListener("beforeunload", prevent);
        return () => window.removeEventListener("beforeunload", prevent);
    }, [draft, dirty, storageKey]);
    useEffect(() => {
        let active = true;
        request(`history/${exercise.id}?page=${page}`, isHistory).then(result => {
            if (!active) return;
            setHistory(current => page === 0 ? result.entries : [...current, ...result.entries.filter(log => !current.some(old => old.id === log.id))]);
            setHasMore(result.hasMore); setHistoryError(false);
        }).catch(() => {if (active) setHistoryError(true);})
            .finally(() => {if (active) setHistoryLoading(false);});
        return () => {active = false;};
    }, [exercise.id, page, reload]);

    function update(index: number, field: keyof SetDraft, value: string) {
        setSaved(false); setError(null);
        setDraft(current => ({...current, rows: current.rows.map((row, i) => i === index ? {...row, [field]: value} : row)}));
    }
    async function save() {
        if (busy) return;
        const sets = completedSets(draft.rows);
        if (!draft.pending && !sets) {setError(400); return;}
        const payload = draft.pending ?? {id: crypto.randomUUID(), exerciseId: exercise.id, trackingMode: unit, sets: sets!};
        setDraft(current => ({...current, pending: payload})); setBusy(true); setError(null);
        try {
            const log = await request("logs", isExerciseLog, payload, "POST");
            setHistory(current => [log, ...current.filter(old => old.id !== log.id)]);
            setDraft(current => ({...current, rows: Array.from({length: initialSets}, () => ({value: "", weight: ""})), pending: null}));
            setSaved(true); setHistoryLoading(true); setPage(0); setReload(value => value + 1);
        } catch (failure) {
            const status = failure instanceof WorkoutError ? failure.status : 503;
            setError(status);
            if (status === 400 || status === 401 || status === 403 || status === 404 || status === 409)
                setDraft(current => ({...current, pending: null}));
        } finally {setBusy(false);}
    }
    const valueLabel = t(unit === "seconds" ? "workout.durationSeconds" : "workout.reps");
    return <section className={styles.tracking}>
        <h2>{t("workout.tracking")}</h2><p className={styles.muted}>{t("workout.actualHint")}</p>
        {withWeight && <p className={styles.muted}>{t("workout.weightHint")}</p>}
        <form onSubmit={event => {event.preventDefault(); void save();}}>
            <fieldset disabled={busy || draft.pending !== null} className={styles.setFields}>
                <div className={styles.trackingOptions}>
                    <label>{t("workout.recordUnit")}<select value={unit} onChange={event => setDraft(current => ({...current, unit: event.target.value as "reps" | "seconds"}))}>
                        <option value="reps">{t("workout.reps")}</option><option value="seconds">{t("workout.durationSeconds")}</option>
                    </select></label>
                    <label className={styles.weightToggle}><input type="checkbox" checked={withWeight} onChange={event => {
                        const checked = event.target.checked;
                        setDraft(current => ({...current, withWeight: checked, rows: current.rows.map(row => ({...row, weight: checked ? row.weight : ""}))}));
                    }} />{t("workout.optionalWeight")}</label>
                </div>
                {draft.rows.map((row, index) => <div className={styles.setRow} key={index}>
                    <span>{t("workout.setNumber", {number: index + 1})}</span>
                    <label>{valueLabel}<input aria-label={`${t("workout.setNumber", {number: index + 1})}: ${valueLabel}`} type="number" inputMode="numeric" min="0" max="86400" step="1" value={row.value} onChange={event => update(index, "value", event.target.value)} /></label>
                    {withWeight && <label>{t("workout.weightKg")}<input aria-label={`${t("workout.setNumber", {number: index + 1})}: ${t("workout.weightKg")}`} type="number" inputMode="decimal" min="0" max="10000" step="0.01" value={row.weight} onChange={event => update(index, "weight", event.target.value)} /></label>}
                </div>)}
                <button type="button" disabled={draft.rows.length >= 100} onClick={() => setDraft(current => ({...current, rows: [...current.rows, {value: "", weight: ""}]}))}>{t("workout.addSet")}</button>
            </fieldset>
            {draft.pending && !busy && <p className={styles.muted}>{t("workout.retryTrackingHint")}</p>}
            {error && <p role="alert" className={styles.error}>{t(error === 400 ? "workout.invalidTracking" : error === 409 ? "workout.trackingChanged" : error === 401 || error === 403 ? "workout.trackingAuth" : "workout.unavailable")}</p>}
            <button className={styles.primary} disabled={busy || (!dirty && !draft.pending)} type="submit">{t(busy ? "workout.saving" : draft.pending ? "workout.retry" : "workout.saveSets")}</button>
            {saved && <p role="status" className={styles.success}>{t("workout.trackingSaved")}</p>}
        </form>
        <h2 className={styles.historyTitle}>{t("workout.history")}</h2>
        {historyLoading && <p role="status">{t("workout.loading")}</p>}
        {historyError && <div role="alert"><p>{t("workout.unavailable")}</p><button onClick={() => {setHistoryLoading(true); setReload(value => value + 1);}}>{t("workout.retry")}</button></div>}
        {!historyLoading && !historyError && !history.length && <p className={styles.muted}>{t("workout.historyEmpty")}</p>}
        <ol className={styles.history}>{history.map(log => <li key={log.id}>
            <time dateTime={log.recordedAt}>{new Intl.DateTimeFormat(locale, {dateStyle: "medium", timeStyle: "short"}).format(new Date(log.recordedAt))}</time>
            <p className={styles.muted}>{locale === "de" ? exercise.nameDe : exercise.name}</p>
            {log.sets.map(set => <div className={styles.historySet} key={set.setNumber}><span>{t("workout.setNumber", {number: set.setNumber})}</span>
                <strong>{set.value} {t(log.trackingMode === "seconds" ? "workout.secondsShort" : "workout.reps")}{set.weight !== null && ` · ${new Intl.NumberFormat(locale).format(set.weight)} kg`}</strong></div>)}
        </li>)}</ol>
        {hasMore && !historyError && <button disabled={historyLoading} onClick={() => {setHistoryLoading(true); setPage(value => value + 1);}}>{t("workout.more")}</button>}
    </section>;
}
