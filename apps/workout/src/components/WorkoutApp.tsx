"use client";

import {useEffect, useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {appPath} from "@oskar-lab/config/paths";
import {useCurrentUser} from "@oskar-lab/auth/useCurrentUser";
import {useI18n} from "@oskar-lab/i18n/I18nProvider";
import {isExercise, isPlan, isPlanPage, type Exercise, type Plan} from "../model/workout";
import {request, WorkoutError} from "../services/client";
import PlanEditor from "./PlanEditor";
import SessionView from "./SessionView";
import styles from "./Workout.module.css";

const isCatalog = (v: unknown): v is Exercise[] => Array.isArray(v) && v.every(isExercise);
const isPlans = (v: unknown): v is Plan[] => Array.isArray(v) && v.every(isPlan);


/** Reloads account-scoped UI on identity changes so drafts cannot cross accounts. */
export default function WorkoutApp({planId, exercisePosition}: {planId?: string; exercisePosition?: number}) {
    const {user, loading} = useCurrentUser();
    const {t} = useI18n();
    if (loading) return <main className={styles.page}><p role="status">{t("workout.loading")}</p></main>;
    return <Sessions key={`${user?.id ?? "guest"}:${planId ?? "overview"}`} signedIn={!!user} planId={planId} exercisePosition={exercisePosition} />;
}

function Sessions({signedIn, planId, exercisePosition}: {signedIn: boolean; planId?: string; exercisePosition?: number}) {
    const router = useRouter();
    const {t} = useI18n();
    const [catalog, setCatalog] = useState<Exercise[]>([]);
    const [templates, setTemplates] = useState<Plan[]>([]);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [selected, setSelected] = useState<Plan | null>(null);
    const [editing, setEditing] = useState<{plan: Plan; create: boolean} | null>(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<number | null>(null);
    const [saved, setSaved] = useState(false);
    const [reload, setReload] = useState(0);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    useEffect(() => {
        let active = true;
        Promise.all([request("exercises", isCatalog), request("templates", isPlans),
            signedIn && !planId ? request("plans", isPlanPage) : Promise.resolve({plans: [], hasMore: false})])
            .then(async ([exercises, starters, personal]) => {
                const session = planId ? starters.find(plan => plan.id === planId) ?? await request(`plans/${planId}`, isPlan) : null;
                if (!active) return;
                setCatalog(exercises); setTemplates(starters); setPlans(personal.plans);
                setHasMore(personal.hasMore); setPage(0); setError(null); setSelected(session);
            }).catch(e => {if (active) setError(e instanceof WorkoutError ? e.status : 503);})
            .finally(() => {if (active) setLoading(false);});
        return () => {active = false;};
    }, [signedIn, reload, planId]);
    useEffect(() => {
        if (!editing) return;
        const prevent = (event: BeforeUnloadEvent) => event.preventDefault();
        window.addEventListener("beforeunload", prevent);
        return () => window.removeEventListener("beforeunload", prevent);
    }, [editing]);
    function edit(plan?: Plan) {
        setSaved(false); setError(null);
        const create = !plan || plan.template;
        setEditing({create, plan: plan ? {...plan, id: create ? crypto.randomUUID() : plan.id, version: create ? 0 : plan.version, template: false, exercises: plan.exercises.map(e => ({...e}))} :
            {id: crypto.randomUUID(), version: 0, name: "", notes: "", template: false, exercises: []}});
    }
    async function save(plan: Plan) {
        if (!editing || busy) return;
        setBusy(true); setError(null);
        try {
            const result = await request(editing.create ? "plans" : `plans/${plan.id}`, isPlan, plan, editing.create ? "POST" : "PUT");
            setPlans(current => [result, ...current.filter(p => p.id !== result.id)]);
            setSelected(result); setEditing(null); setSaved(true);
            if (planId !== result.id) router.push(`/sessions/${result.id}`);
            else window.scrollTo({top: 0});
        } catch (e) {setError(e instanceof WorkoutError ? e.status : 503);}
        finally {setBusy(false);}
    }
    async function more() {
        setBusy(true); setError(null);
        try {
            const result = await request(`plans?page=${page + 1}`, isPlanPage);
            setPlans(current => [...current, ...result.plans.filter(p => !current.some(old => old.id === p.id))]);
            setHasMore(result.hasMore); setPage(page + 1);
        } catch (e) {setError(e instanceof WorkoutError ? e.status : 503);}
        finally {setBusy(false);}
    }
    function cards(items: Plan[]) {
        return <div className={styles.cards}>{items.map(plan => <Link className={styles.card} key={plan.id} href={`/sessions/${plan.id}`}>
            <span className={styles.badge}>{plan.template ? plan.name.charAt(0) : "↗"}</span>
            <strong>{plan.name}</strong><span className={styles.muted}>{t(plan.exercises.length === 1 ? "workout.oneExercise" : "workout.exerciseCount", {count: plan.exercises.length})}</span>
        </Link>)}</div>;
    }
    return <main className={`${styles.page} ${planId ? styles.sessionPage : ""}`}>
        {!planId && <header className={styles.hero}>
            <p className={styles.kicker}>{t("workout.kicker")}</p>
            <h1>{t("workout.title")}</h1><p>{t("workout.intro")}</p>
            {!editing && signedIn && <button className={styles.primary} disabled={loading || !catalog.length} onClick={() => edit()}>{t("workout.create")}</button>}
        </header>}
        {!planId && !signedIn && <p className={styles.notice}>{t("workout.signInHint")} <a href={`${process.env.NEXT_PUBLIC_PLATFORM_URL ?? ""}/account`}>{t("workout.signIn")}</a></p>}
        {loading && <p role="status">{t("workout.loading")}</p>}
        {saved && <p role="status" className={styles.success}>{t("workout.saved")}</p>}
        {error && <div className={styles.error} role="alert">
            <p>{t(error === 401 || error === 403 ? "workout.unauthorized" : error === 409 ? "workout.conflict" : error === 404 ? "workout.notFound" : error === 400 ? "workout.invalid" : "workout.unavailable")}</p>
            {(error === 401 || error === 403) && <a href={`${process.env.NEXT_PUBLIC_PLATFORM_URL ?? ""}/account?returnTo=${encodeURIComponent(appPath(planId ? `/sessions/${planId}` : "/"))}`}>{t("workout.signIn")}</a>}
            {!editing && <button onClick={() => {setLoading(true); setReload(reload + 1);}}>{t("workout.retry")}</button>}
        </div>}
        {editing ? <PlanEditor key={editing.plan.id} initial={editing.plan} catalog={catalog} busy={busy} onSave={save} onCancel={() => {setEditing(null); setError(null);}} /> : !loading && <>
            {!planId && signedIn && <section className={styles.section} aria-labelledby="personal-title"><h2 id="personal-title">{t("workout.personal")}</h2>
                {!plans.length && !error && <p className={styles.muted}>{t("workout.empty")}</p>}{cards(plans)}
                {hasMore && <button disabled={busy} onClick={more}>{t("workout.more")}</button>}
            </section>}
            {!planId && <section className={styles.section} aria-labelledby="templates-title"><h2 id="templates-title">{t("workout.templates")}</h2>{cards(templates)}</section>}
            {selected && <SessionView plan={selected} catalog={catalog} exercisePosition={exercisePosition}
                canEdit={signedIn} onEdit={() => edit(selected)} />}

        </>}
    </main>;
}
