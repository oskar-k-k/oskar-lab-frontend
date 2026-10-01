"use client";
import Link from "next/link";
import {useI18n} from "@oskar-lab/i18n/I18nProvider";
import {legalMessages} from "@oskar-lab/i18n/legal";
import LanguageSwitch from "@oskar-lab/ui/LanguageSwitch/LanguageSwitch";
import styles from "./AccountForm.module.css";

/** Displays accessible operator details, processing disclosures or existing account terms. */
export default function LegalPage({kind}: {kind: "imprint" | "privacy" | "terms"}) {
    const {t, locale} = useI18n();
    const copy = legalMessages[locale];
    return <main className={styles.page}>
        <LanguageSwitch />
        <article className={`${styles.card} ${styles.legal}`} data-nosnippet>
            <span className={styles.brand}>Oskar Lab</span>
            <h1>{copy[kind]}</h1>
            {kind === "imprint" ? <>
                <p>{copy.imprintIntro}</p>
                <h2>{copy.operator}</h2><p>Oskar Konczarek</p>
                <h2>{copy.contact}</h2><p><a href="mailto:o.konczarek@gmail.com">o.konczarek@gmail.com</a></p>
                <p>{copy.contactNote}</p>
                <h2>{copy.address}</h2><address className={styles.address}>Gudesstraße 43a<br />29525 Uelzen<br />{copy.country}</address>
            </> : kind === "privacy" ? <>
                <p>{copy.updated}</p>
                <p className={styles.feedback}>{copy.pending}</p>
                <a href="/impressum">{copy.imprint}</a>
                {copy.sections.map(([title, body]) => <section key={title}><h2>{title}</h2><p>{body}</p></section>)}
                <p><a href="https://www.lfd.niedersachsen.de/beschwerde" rel="noreferrer">{copy.authority}</a></p>
                <p><a href="https://policies.google.com/privacy" rel="noreferrer">{copy.google}</a></p>
            </> : <>
                <p>{t("auth.termsIntro")}</p>
                <p>{copy.operator}: Oskar Konczarek · <a href="/impressum">{copy.imprint}</a></p>
                <h2>{t("auth.termsScope")}</h2><p>{t("auth.termsUse")}</p>
                <h2>{t("auth.termsUploads")}</h2><p>{t("auth.termsContent")}</p>
                <h2>{t("auth.termsCasino")}</h2><p>{t("auth.termsGames")}</p>
                <h2>{t("auth.termsAvailability")}</h2><p>{t("auth.termsOperation")}</p>
                <h2>{t("auth.termsClosing")}</h2><p>{t("auth.termsEnd")}</p>
                <p>{copy.contactNote} <a href="mailto:o.konczarek@gmail.com">o.konczarek@gmail.com</a></p>
                <a href="/privacy">{copy.privacy}</a>
            </>}
        </article>
        <Link href="/">{copy.back}</Link>
    </main>;
}
