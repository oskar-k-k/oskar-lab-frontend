"use client";

import {useEffect, useRef, useState} from "react";
import {useI18n} from "@/lib/i18n/I18nProvider";
import type {Locale} from "@/lib/i18n/messages";
import styles from "./LanguageSwitch.module.css";

const localeOptions: ReadonlyArray<{locale: Locale; labelKey: "language.english" | "language.german"}> = [
    {locale: "en", labelKey: "language.english"},
    {locale: "de", labelKey: "language.german"},
];

function FlagIcon({locale}: Readonly<{locale: Locale}>) {
    if (locale === "de") {
        return <svg className={styles.flag} viewBox="0 0 30 20" aria-hidden="true">
            <path fill="#151515" d="M0 0h30v6.67H0z" />
            <path fill="#d00" d="M0 6.67h30v6.66H0z" />
            <path fill="#ffce00" d="M0 13.33h30V20H0z" />
        </svg>;
    }

    return <svg className={styles.flag} viewBox="0 0 30 20" aria-hidden="true">
        <path fill="#174a8b" d="M0 0h30v20H0z" />
        <path stroke="#fff" strokeWidth="4" d="m0 0 30 20M30 0 0 20" />
        <path stroke="#cf1834" strokeWidth="2" d="m0 0 30 20M30 0 0 20" />
        <path fill="#fff" d="M12 0h6v20h-6zM0 7h30v6H0z" />
        <path fill="#cf1834" d="M13.5 0h3v20h-3zM0 8.5h30v3H0z" />
    </svg>;
}

/** Switches the global UI language and persists the choice in a cookie. */
export default function LanguageSwitch() {
    const {locale, setLocale, t} = useI18n();
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const current = localeOptions.find(option => option.locale === locale) ?? localeOptions[0];

    useEffect(() => {
        if (!open) return;
        function closeMenu(event: MouseEvent): void {
            if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
        }
        document.addEventListener("pointerdown", closeMenu);
        return () => document.removeEventListener("pointerdown", closeMenu);
    }, [open]);

    return <div className={styles.wrapper} ref={wrapperRef} onKeyDown={event => {if (event.key === "Escape") setOpen(false);}}>
        <button type="button" className={styles.trigger} aria-label={`${t("language.label")}: ${t(current.labelKey)}`} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(value => !value)}><FlagIcon locale={current.locale} /></button>
        {open && <div className={styles.menu} role="menu" aria-label={t("language.label")}>{localeOptions.map(option => <button type="button" role="menuitemradio" aria-checked={locale === option.locale} key={option.locale} onClick={() => {setLocale(option.locale); setOpen(false);}}><FlagIcon locale={option.locale} /><span>{t(option.labelKey)}</span></button>)}</div>}
    </div>;
}
