"use client";
import Link from "next/link";
import {useI18n} from "@oskar-lab/i18n/I18nProvider";
import LanguageSwitch from "@oskar-lab/ui/LanguageSwitch/LanguageSwitch";
import styles from "./AccountForm.module.css";

/** Displays versioned draft terms and transparent account privacy information. */
export default function LegalPage({privacy = false}: {privacy?: boolean}) {
    const {t} = useI18n();
    return <main className={styles.page}><LanguageSwitch /><article className={`${styles.card} ${styles.legal}`}>
        <span className={styles.brand}>Oskar Lab</span>
        <h1>{t(privacy ? "auth.privacy" : "auth.terms")}</h1>
        <p className={styles.feedback}>{t("auth.termsDraft")}</p>
        {privacy ? <><p>{t("auth.privacyIntro")}</p><p>{t("auth.privacySession")}</p><p>{t("auth.privacyDraft")}</p></> : <>
            <p>{t("auth.termsIntro")}</p>
            <h2>{t("auth.termsScope")}</h2><p>{t("auth.termsUse")}</p>
            <h2>{t("auth.termsUploads")}</h2><p>{t("auth.termsContent")}</p>
            <h2>{t("auth.termsCasino")}</h2><p>{t("auth.termsGames")}</p>
            <h2>{t("auth.termsAvailability")}</h2><p>{t("auth.termsOperation")}</p>
            <h2>{t("auth.termsClosing")}</h2><p>{t("auth.termsEnd")}</p>
            <a href="/privacy">{t("auth.privacy")}</a>
        </>}
    </article><Link href="/">{t("auth.back")}</Link></main>;
}
