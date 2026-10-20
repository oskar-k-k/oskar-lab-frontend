"use client";
import {useI18n} from "@oskar-lab/i18n/I18nProvider";
import {useResume} from "@oskar-lab/query/useResume";
import styles from "../components/Workout.module.css";

/** Retries the current route after recovery without sending the user back to the plan list. */
export default function WorkoutErrorPage({reset}: {error: Error & {digest?: string}; reset: () => void}) {
    const {t} = useI18n();
    useResume(reset);
    return <main className={styles.page}><div role="alert"><p>{t("workout.unavailable")}</p>
        <button onClick={reset}>{t("workout.retry")}</button></div></main>;
}
