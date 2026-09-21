"use client";
import {useI18n} from "@oskar-lab/i18n/I18nProvider";
/** Offers recovery when this application fails to render. */
export default function AppError({reset}: {reset: () => void}) { const {t}=useI18n(); return <main role="alert"><h1>{t("common.appError")}</h1><button onClick={reset}>{t("common.retry")}</button></main>; }
