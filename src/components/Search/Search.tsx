"use client";

import {useId} from "react";
import type {InputHTMLAttributes} from "react";
import styles from "./Search.module.css";
import {useI18n} from "@/lib/i18n/I18nProvider";

/** Props for the controlled, reusable search field. */
export interface SearchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "type" | "value"> {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    resultCount?: number;
}

/** Captures a search query while the parent owns filtering and result rendering. */
export default function Search({
                                   value,
                                   onChange,
                                   label,
                                   placeholder,
                                   resultCount,
                                   className = "",
                                   id,
                                   ...inputProps
                               }: SearchProps) {
    const generatedId = useId();
    const {t} = useI18n();
    const inputId = id ?? generatedId;
    const accessibleLabel = label ?? t("common.search");
    const visiblePlaceholder = placeholder ?? `${t("common.search")} …`;

    return <div className={`${styles.search} ${className}`} role="search">
        <label className={styles.visuallyHidden} htmlFor={inputId}>{accessibleLabel}</label>
        <svg className={styles.icon} aria-hidden="true" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4 4" />
        </svg>
        <input
            {...inputProps}
            id={inputId}
            type="search"
            value={value}
            placeholder={visiblePlaceholder}
            onChange={event => onChange(event.target.value)}
        />
        {value && <button type="button" className={styles.clear} onClick={() => onChange("")} aria-label={t("common.clearSearch")}>×</button>}
        {resultCount !== undefined && <span className={styles.visuallyHidden} aria-live="polite">{resultCount} {t("common.results")}</span>}
    </div>;
}
