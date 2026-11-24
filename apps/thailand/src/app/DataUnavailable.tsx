"use client";

import {appPath} from "@oskar-lab/config/paths";
import {useI18n} from "@oskar-lab/i18n/I18nProvider";
import styles from "./DataUnavailable.module.css";

/** Explains missing private data after the server has verified access. */
export default function DataUnavailable() {
    const {t} = useI18n();
    return <main className={styles.page}>
        <h1>{t("thailand.unavailable.title")}</h1>
        <p>{t("thailand.unavailable.description")}</p>
        <p>{t("thailand.unavailable.action")}</p>
        <a href={appPath("/")}>{t("thailand.unavailable.retry")}</a>
    </main>;
}
