"use client";
import Link from "next/link";
import {useI18n} from "@oskar-lab/i18n/I18nProvider";
import {extensionPrivacy} from "@oskar-lab/i18n/extension-privacy";
import LanguageSwitch from "@oskar-lab/ui/LanguageSwitch/LanguageSwitch";
import styles from "../../account/AccountForm.module.css";

/** Shows extension-specific data handling without requiring an account. */
export default function PrivacyContent() {
    const {locale} = useI18n();
    const copy = extensionPrivacy[locale];
    return <main className={styles.page}>
        <LanguageSwitch />
        <article className={`${styles.card} ${styles.legal}`} data-nosnippet>
            <span className={styles.brand}>Modern Reading</span>
            <h1>{copy.title}</h1><p>{copy.updated}</p>
            {copy.sections.map(([title, body]) => <section key={title}><h2>{title}</h2><p>{body}</p></section>)}
            <p><a href="mailto:o.konczarek@gmail.com">o.konczarek@gmail.com</a></p>
            <p><Link href="/impressum">{copy.imprint}</Link></p>
            <p><Link href="/privacy">{copy.website}</Link></p>
        </article>
    </main>;
}
