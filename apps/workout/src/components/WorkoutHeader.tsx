"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import Header from "@oskar-lab/platform-shell/Header/Header";
import {useI18n} from "@oskar-lab/i18n/I18nProvider";
import styles from "./Workout.module.css";

/** Keeps session navigation focused on returning to the plan picker. */
export default function WorkoutHeader() {
    const pathname = usePathname();
    const {t} = useI18n();
    const independent = pathname.includes("/exercises") && !pathname.includes("/sessions/");
    if (!pathname.includes("/sessions/") && !independent) return <Header appName="Workout" />;
    const exercise = pathname.match(/\/sessions\/([0-9a-f-]+)\/exercises\//i);
    const backToCatalog = independent && /\/exercises\/[^/]+/.test(pathname);
    const backLabel = t(backToCatalog ? "workout.backToExercises" : exercise ? "workout.backToSession" : "workout.backToPlans");
    return <header className={styles.sessionHeader}>
        <Link href={backToCatalog ? "/exercises" : exercise ? `/sessions/${exercise[1]}` : "/"} aria-label={backLabel}>
            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m14 6-6 6 6 6M8 12h13" /></svg>
            <span>{backLabel}</span>
        </Link>
    </header>;
}
