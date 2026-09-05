"use client";

import {useEffect, useRef, useState} from "react";
import {useI18n} from "@/lib/i18n/I18nProvider";
import type {Locale} from "@/lib/i18n/messages";
import styles from "./LanguageSwitch.module.css";

const localeOptions: ReadonlyArray<{locale: Locale; flag: string; labelKey: "language.english" | "language.german"}> = [
    {locale: "en", flag: "🇬🇧", labelKey: "language.english"},
    {locale: "de", flag: "🇩🇪", labelKey: "language.german"},
];

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
        <button type="button" className={styles.trigger} aria-label={`${t("language.label")}: ${t(current.labelKey)}`} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(value => !value)}><span aria-hidden="true">{current.flag}</span></button>
        {open && <div className={styles.menu} role="menu" aria-label={t("language.label")}>{localeOptions.map(option => <button type="button" role="menuitemradio" aria-checked={locale === option.locale} key={option.locale} onClick={() => {setLocale(option.locale); setOpen(false);}}><span aria-hidden="true">{option.flag}</span><span>{t(option.labelKey)}</span></button>)}</div>}
    </div>;
}
