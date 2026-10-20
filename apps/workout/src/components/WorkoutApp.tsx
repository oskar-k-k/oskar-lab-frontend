"use client";

import {useQuery, useInfiniteQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {catalogQuery, templatesQuery, personalPlansQuery, planQuery, workoutKeys} from "../services/queries";
import {useEffect, useRef, useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {appPath} from "@oskar-lab/config/paths";
import {useCurrentUser} from "@oskar-lab/auth/useCurrentUser";
import {useI18n} from "@oskar-lab/i18n/I18nProvider";
import {isPlan, type Plan} from "../model/workout";
import {request, WorkoutError} from "../services/client";
import PlanEditor from "./PlanEditor";
import SessionView from "./SessionView";
import styles from "./Workout.module.css";
/** Reloads account-scoped UI on identity changes so drafts cannot cross accounts. */
export default function WorkoutApp({planId, exercisePosition}: {planId?: string; exercisePosition?: number}) {
    const {user, loading} = useCurrentUser();
    const {t} = useI18n();
    if (loading) return <main className={styles.page}><p role="status">{t("workout.loading")}</p></main>;
    return <Sessions key={`${user?.id ?? "guest"}:${planId ?? "overview"}`} ownerId={user?.id ?? null} planId={planId} exercisePosition={exercisePosition} />;
}

function Sessions({ownerId, planId, exercisePosition}: {ownerId: string | null; planId?: string; exercisePosition?: number}) {
    const router = useRouter();
    const {t} = useI18n();
    const signedIn = ownerId !== null;
    const client = useQueryClient();
    const saveAbort = useRef<AbortController | null>(null);
    useEffect(() => {
        const controller = new AbortController();
        saveAbort.current = controller;
        return () => controller.abort();
    }, []);
    const [editing, setEditing] = useState<{plan: Plan; create: boolean} | null>(null);
    const [error, setError] = useState<number | null>(null);
    const [saved, setSaved] = useState(false);
    const saveMutation = useMutation({mutationFn: ({plan, create}: {plan: Plan; create: boolean}) =>
        request(create ? "plans" : `plans/${plan.id}`, isPlan, plan, create ? "POST" : "PUT", saveAbort.current?.signal)});
    const catalogResult = useQuery(catalogQuery());
    const starters = useQuery(templatesQuery());
    const personal = useInfiniteQuery({...personalPlansQuery(ownerId), enabled: signedIn && !planId && !editing && !saveMutation.isPending});
    const detail = useQuery({...planQuery(ownerId, planId ?? "", starters.data ?? []), enabled: !!planId && starters.isSuccess && !editing});
    const catalog = catalogResult.data ?? [];
    const templates = starters.data ?? [];
    const plans = [...new Map((personal.data?.pages.flatMap(page => page.plans) ?? []).map(plan => [plan.id, plan])).values()];
    const selected = planId ? detail.data ?? null : null;
    const loading = catalogResult.isPending || starters.isPending ||
        (signedIn && !planId && personal.isPending) || (!!planId && starters.isSuccess && detail.isPending);
    const busy = saveMutation.isPending || personal.isFetchingNextPage;
    const waitingForConnection = catalogResult.isPaused || starters.isPaused || (planId ? detail.isPaused : signedIn && personal.isPaused);
    const hasMore = personal.hasNextPage;
    const readError = catalogResult.error ?? starters.error ?? (planId ? detail.error : signedIn ? personal.error : null);
    const displayedError = error ?? (readError ? readError instanceof WorkoutError ? readError.status : 503 : null);
    function retry() {
        void catalogResult.refetch();
        void starters.refetch();
        if (planId) void detail.refetch();
        else if (signedIn) void personal.refetch();
    }
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
        setError(null);
        try {
            const result = await saveMutation.mutateAsync({plan, create: editing.create});
            client.setQueryData(workoutKeys.plan(ownerId, result.id), result);
            void client.invalidateQueries({queryKey: [...workoutKeys.personal(ownerId), "plans"]});
            setEditing(null); setSaved(true);
            if (planId !== result.id) router.push(`/sessions/${result.id}`);
            else window.scrollTo({top: 0});
        } catch (failure) {setError(failure instanceof WorkoutError ? failure.status : 503);}
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
            <Link href="/exercises" className={styles.trackLink}>{t("workout.trackIndependent")}</Link>
            {!editing && signedIn && <button className={styles.primary} disabled={loading || !catalog.length} onClick={() => edit()}>{t("workout.create")}</button>}
        </header>}
        {!planId && !signedIn && <p className={styles.notice}>{t("workout.signInHint")} <a href={`${process.env.NEXT_PUBLIC_PLATFORM_URL ?? ""}/account`}>{t("workout.signIn")}</a></p>}
        {loading && <p role="status">{t(waitingForConnection ? "query.waitingConnection" : "workout.loading")}</p>}
        {saved && <p role="status" className={styles.success}>{t("workout.saved")}</p>}
        {displayedError && <div className={styles.error} role="alert">
            <p>{t(displayedError === 401 || displayedError === 403 ? "workout.unauthorized" : displayedError === 409 ? "workout.conflict" : displayedError === 404 ? "workout.notFound" : displayedError === 400 ? "workout.invalid" : "workout.unavailable")}</p>
            {(displayedError === 401 || displayedError === 403) && <a href={`${process.env.NEXT_PUBLIC_PLATFORM_URL ?? ""}/account?returnTo=${encodeURIComponent(appPath(planId ? `/sessions/${planId}${exercisePosition === undefined ? "" : `/exercises/${exercisePosition}`}` : "/"))}`}>{t("workout.signIn")}</a>}
            {!editing && <button onClick={retry}>{t("workout.retry")}</button>}
        </div>}
        {editing ? <PlanEditor key={editing.plan.id} initial={editing.plan} catalog={catalog} busy={busy} onSave={save} onCancel={() => {setEditing(null); setError(null);}} /> : !loading && <>
            {!planId && signedIn && <section className={styles.section} aria-labelledby="personal-title"><h2 id="personal-title">{t("workout.personal")}</h2>
                {!plans.length && !displayedError && <p className={styles.muted}>{t("workout.empty")}</p>}{cards(plans)}
                {hasMore && <button disabled={busy} onClick={() => void personal.fetchNextPage()}>{t("workout.more")}</button>}
            </section>}
            {!planId && <section className={styles.section} aria-labelledby="templates-title"><h2 id="templates-title">{t("workout.templates")}</h2>{cards(templates)}</section>}
            {selected && <SessionView plan={selected} catalog={catalog} exercisePosition={exercisePosition}
                canEdit={signedIn} onEdit={() => edit(selected)} />}

        </>}
    </main>;
}
