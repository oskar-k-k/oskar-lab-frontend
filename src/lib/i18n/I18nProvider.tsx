"use client";

import {createContext, useContext, useMemo, useState} from "react";
import {messages, type Locale, type TranslationKey} from "./messages";

type Variables = Readonly<Record<string, string | number>>;
type I18nContextValue = Readonly<{locale: Locale; setLocale: (locale: Locale) => void; t: (key: TranslationKey, variables?: Variables) => string}>;
const I18nContext = createContext<I18nContextValue | null>(null);

function formatMessage(message: string, variables: Variables): string {
    return message.replace(/\{(\w+)}/g, (_, key: string) => String(variables[key] ?? `{${key}}`));
}

/** Provides the current UI language and typed translations to all client components. */
export default function I18nProvider({initialLocale, children}: Readonly<{initialLocale: Locale; children: React.ReactNode}>) {
    const [locale, updateLocale] = useState(initialLocale);
    const value = useMemo<I18nContextValue>(() => ({
        locale,
        setLocale(nextLocale) {
            updateLocale(nextLocale);
            document.documentElement.lang = nextLocale;
            document.cookie = `oskar-lab-locale=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;
        },
        t(key, variables = {}) {
            return formatMessage(messages[locale][key], variables);
        },
    }), [locale]);

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** Reads the current locale and translation function. */
export function useI18n(): I18nContextValue {
    const context = useContext(I18nContext);
    if (!context) throw new Error("useI18n must be used inside I18nProvider");
    return context;
}
