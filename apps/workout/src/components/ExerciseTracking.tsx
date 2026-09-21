"use client";

import {useEffect, useState} from "react";
import {useCurrentUser} from "@oskar-lab/auth/useCurrentUser";
import {useI18n} from "@oskar-lab/i18n/I18nProvider";
import {appPath} from "@oskar-lab/config/paths";
import type {Entry, Plan} from "../model/workout";
import {completedSets, isExerciseLog, isHistory, isSaveLog, trackingMode, type ExerciseLog, type SaveLog, type SetDraft} from "../model/tracking";
import {request, WorkoutError} from "../services/client";
import styles from "./Workout.module.css";

type Props = {plan: Plan; entry: Entry; position: number};
type Draft = {rows: SetDraft[]; pending: SaveLog | null};

function readDraft(key: string, count: number): Draft {
    const empty = {rows: Array.from({length: count}, () => ({value: "", weight: ""})), pending: null};
    try {
        const value: unknown = JSON.parse(sessionStorage.getItem(key) ?? "null");
        if (!value || typeof value !== "object") return empty;
        const draft = value as Draft;
        if (!Array.isArray(draft.rows) || !draft.rows.length || draft.rows.length > 100 ||
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
        <a href={`${process.env.NEXT_PUBLIC_PLATFORM_URL ?? ""}/account?returnTo=${encodeURIComponent(appPath(`/sessions/${props.plan.id}/exercises/${props.position}`))}`}>{t("workout.signIn")}</a></section>;
    return <PersonalTracking key={`${user.id}:${props.plan.id}:${props.plan.version}:${props.position}`} {...props} ownerId={user.id} />;
}

function PersonalTracking({plan, entry, position, ownerId}: Props & {ownerId: string}) {
    const {t, locale} = useI18n();
    const unit = trackingMode(entry);
    const storageKey = `workout-draft:${ownerId}:${plan.id}:${plan.version}:${position}:${unit}`;
    const [draft, setDraft] = useState(() => readDraft(storageKey, entry.setsMax));
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
        request(`history/${entry.exerciseId}?page=${page}`, isHistory).then(result => {
            if (!active) return;
            setHistory(current => page === 0 ? result.entries : [...current, ...result.entries.filter(log => !current.some(old => old.id === log.id))]);
            setHasMore(result.hasMore); setHistoryError(false);
        }).catch(() => {if (active) setHistoryError(true);})
            .finally(() => {if (active) setHistoryLoading(false);});
        return () => {active = false;};
    }, [entry.exerciseId, page, reload]);

    function update(index: number, field: keyof SetDraft, value: string) {
        setSaved(false); setError(null);
        setDraft(current => ({...current, rows: current.rows.map((row, i) => i === index ? {...row, [field]: value} : row)}));
    }
    async function save() {
        if (busy) return;
        const sets = completedSets(draft.rows, unit);
        if (!draft.pending && !sets) {setError(400); return;}
        const payload = draft.pending ?? {id: crypto.randomUUID(), planId: plan.id, planVersion: plan.version,
            position, exerciseId: entry.exerciseId, trackingMode: unit, sets: sets!};
        setDraft(current => ({...current, pending: payload})); setBusy(true); setError(null);
        try {
            const log = await request("logs", isExerciseLog, payload, "POST");
            setHistory(current => [log, ...current.filter(old => old.id !== log.id)]);
            setDraft({rows: Array.from({length: entry.setsMax}, () => ({value: "", weight: ""})), pending: null});
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
        {unit === "weighted" && <p className={styles.muted}>{t("workout.weightHint")}</p>}
        <form onSubmit={event => {event.preventDefault(); void save();}}>
            <fieldset disabled={busy || draft.pending !== null} className={styles.setFields}>
                {draft.rows.map((row, index) => <div className={styles.setRow} key={index}>
                    <span>{t("workout.setNumber", {number: index + 1})}</span>
                    <label>{valueLabel}<input aria-label={`${t("workout.setNumber", {number: index + 1})}: ${valueLabel}`} type="number" inputMode="numeric" min="0" max="86400" step="1" value={row.value} onChange={event => update(index, "value", event.target.value)} /></label>
                    {unit === "weighted" && <label>{t("workout.weightKg")}<input aria-label={`${t("workout.setNumber", {number: index + 1})}: ${t("workout.weightKg")}`} type="number" inputMode="decimal" min="0" max="10000" step="0.01" value={row.weight} onChange={event => update(index, "weight", event.target.value)} /></label>}
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
            <p className={styles.muted}>{log.planName}</p>
            {log.sets.map(set => <div className={styles.historySet} key={set.setNumber}><span>{t("workout.setNumber", {number: set.setNumber})}</span>
                <strong>{set.value} {t(log.trackingMode === "seconds" ? "workout.secondsShort" : "workout.reps")}{set.weight !== null && ` · ${new Intl.NumberFormat(locale).format(set.weight)} kg`}</strong></div>)}
        </li>)}</ol>
        {hasMore && !historyError && <button disabled={historyLoading} onClick={() => {setHistoryLoading(true); setPage(value => value + 1);}}>{t("workout.more")}</button>}
    </section>;
}
