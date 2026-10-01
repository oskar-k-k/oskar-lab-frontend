"use client";
import {useI18n} from "@oskar-lab/i18n/I18nProvider";
import styles from "./LegalLinks.module.css";

/** Keeps legal pages reachable from integrated and standalone apps without exposing operator data here. */
export default function LegalLinks() {
    const {t} = useI18n();
    const origin = process.env.NEXT_PUBLIC_PLATFORM_URL || "";
    return <nav className={styles.links} aria-label={t("legal.navigation")}>
        <a href={`${origin}/impressum`}>{t("legal.imprint")}</a>
        <a href={`${origin}/privacy`}>{t("legal.privacy")}</a>
        <a href={`${origin}/terms`}>{t("legal.terms")}</a>
    </nav>;
}
