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
    if (!pathname.includes("/sessions/")) return <Header appName="Workout" />;
    return <header className={styles.sessionHeader}>
        <Link href="/" aria-label={t("workout.backToPlans")}>
            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m14 6-6 6 6 6M8 12h13" /></svg>
            <span>{t("workout.backToPlans")}</span>
        </Link>
        <span>{t("workout.session")}</span>
    </header>;
}
