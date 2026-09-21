"use client";

import {useState, type FormEvent} from "react";
import {signIn, signOut, useSession} from "next-auth/react";
import {TERMS_VERSION} from "@oskar-lab/auth/contracts";
import {useI18n} from "@oskar-lab/i18n/I18nProvider";
import {type TranslationKey} from "@oskar-lab/i18n/messages";
import LanguageSwitch from "@oskar-lab/ui/LanguageSwitch/LanguageSwitch";
import styles from "./AccountForm.module.css";

const errorKeys: Record<string, TranslationKey> = Object.fromEntries([
    "invalidCredentials", "invalidEmail", "invalidPassword", "passwordMismatch", "invalidUsername", "termsRequired", "accountExists", "usernameTaken", "rateLimited", "unavailable", "unverifiedGoogle", "sessionExpired",
].map(key => [key, `auth.${key}`])) as Record<string, TranslationKey>;

/** Handles local login, registration and the two Google onboarding steps. */
export default function AccountForm({googleAvailable, returnTo, oauthError}: {googleAvailable: boolean; returnTo: string; oauthError: boolean}) {
    const {t} = useI18n();
    const {data: session, status, update} = useSession();
    const [register, setRegister] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(oauthError ? "oauthError" : null);
    const [notice, setNotice] = useState(false);
    const linking = Boolean(session?.linkRequired);
    const onboarding = Boolean(session && !session.user.complete && !linking);
    const ready = Boolean(session?.user.complete);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setBusy(true); setError(null); setNotice(false);
        const data = Object.fromEntries(new FormData(event.currentTarget));
        try {
            if (linking || onboarding) {
                const result = await update({...data, action: linking ? "link" : "complete", acceptTerms: data.acceptTerms === "on", termsVersion: TERMS_VERSION});
                if (!result) setError("sessionExpired");
                else if (result.accountError) setError(result.accountError);
                else if (result.user.complete) window.location.assign(returnTo);
            } else if (register) {
                if (data.password !== data.passwordRepeat) { setError("passwordMismatch"); return; }
                const response = await fetch("/api/auth/register", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({...data, acceptTerms: data.acceptTerms === "on", termsVersion: TERMS_VERSION})});
                const result = await response.json();
                if (!response.ok) { setError(result.code ?? "unavailable"); return; }
                setRegister(false); setNotice(true);
            } else {
                const result = await signIn("credentials", {identifier: data.identifier, password: data.password, redirect: false});
                if (result?.error) setError(result.code === "rateLimited" ? "rateLimited" : result.code === "unavailable" ? "unavailable" : result.error === "CredentialsSignin" ? "invalidCredentials" : "unavailable");
                else window.location.assign(returnTo);
            }
        } catch { setError("unavailable"); }
        finally { setBusy(false); }
    }

    const title = ready ? "auth.signedIn" : linking ? "auth.linkTitle" : onboarding ? "auth.onboarding" : register ? "auth.register" : "auth.signIn";
    return <main className={styles.page}>
        <LanguageSwitch />
        <section className={styles.card} aria-labelledby="account-title">
            <span className={styles.brand}>Oskar Lab</span>
            <h1 id="account-title">{t(title)}</h1>
            <p>{t(linking ? "auth.linkInfo" : onboarding ? "auth.onboardingInfo" : ready ? "auth.shared" : "auth.intro")}</p>
            {status === "loading" ? <p role="status">{t("auth.loading")}</p> : ready ? <>
                <p><strong>{session?.user.name}</strong><br />{session?.user.email}</p>
                <a className={styles.button} href={returnTo}>{t("auth.back")}</a>
                <button className={`${styles.button} ${styles.secondary}`} onClick={() => signOut({redirectTo: "/account"})}>{t("auth.signOut")}</button>
            </> : <>
                {!session && <div className={styles.tabs}>
                    <button type="button" aria-pressed={!register} onClick={() => {setRegister(false); setError(null);}}>{t("auth.signIn")}</button>
                    <button type="button" aria-pressed={register} onClick={() => {setRegister(true); setError(null);}}>{t("auth.register")}</button>
                </div>}
                {error && <p role="alert" className={styles.feedback}>{t(error === "oauthError" ? "auth.oauthError" : errorKeys[error] ?? "auth.unavailable")}</p>}
                {notice && <p role="status" className={styles.feedback}>{t("auth.registered")}</p>}
                <form className={styles.form} onSubmit={submit} key={`${register}-${linking}-${onboarding}`}>
                    {(register && !linking || onboarding) && <label className={styles.field}>{t("auth.username")}<input name="username" required minLength={3} maxLength={32} pattern="[a-z0-9_]{3,32}" autoComplete="username" aria-describedby="username-hint" /><small id="username-hint">{t("auth.usernameHint")}</small></label>}
                    {register && !session && <label className={styles.field}>{t("auth.email")}<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>}
                    {!register && !session && <label className={styles.field}>{t("auth.identifier")}<input name="identifier" autoComplete="username" required maxLength={254} /></label>}
                    {!onboarding && <label className={styles.field}>{t("auth.password")}<input name="password" type="password" autoComplete={register && !session ? "new-password" : "current-password"} required minLength={register && !session ? 12 : 1} maxLength={128} aria-describedby={register ? "password-hint" : undefined} />{register && <small id="password-hint">{t("auth.passwordHint")}</small>}</label>}
                    {register && !session && <label className={styles.field}>{t("auth.passwordRepeat")}<input name="passwordRepeat" type="password" autoComplete="new-password" required minLength={12} maxLength={128} /></label>}
                    {(register && !session || onboarding) && <label className={styles.check}><input name="acceptTerms" type="checkbox" required /><span>{t("auth.acceptTerms")} <a href="/terms" target="_blank" rel="noreferrer">{t("auth.terms")}</a>.</span></label>}
                    <button className={styles.button} disabled={busy}>{t(busy ? "auth.busy" : linking ? "auth.link" : onboarding ? "auth.complete" : register ? "auth.register" : "auth.signIn")}</button>
                </form>
                {!session && (googleAvailable ? <button type="button" className={`${styles.button} ${styles.secondary}`} disabled={busy} onClick={() => {setBusy(true); void signIn("google", {redirectTo: `/account?returnTo=${encodeURIComponent(returnTo)}`}).catch(() => {setBusy(false); setError("unavailable");});}}>{t("auth.signInWithGoogle")}</button> : <p>{t("auth.googleUnavailable")}</p>)}
                {session && <button className={`${styles.button} ${styles.secondary}`} onClick={() => signOut({redirectTo: "/account"})}>{t("auth.signOut")}</button>}
            </>}
        </section>
        <footer className={styles.footer}><a href={returnTo}>{t("auth.guest")}</a><a href="/terms">{t("auth.terms")}</a><a href="/privacy">{t("auth.privacy")}</a></footer>
    </main>;
}
