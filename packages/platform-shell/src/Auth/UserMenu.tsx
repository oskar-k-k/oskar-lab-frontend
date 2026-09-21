"use client";

import {signOut, useSession} from "next-auth/react";
import {useState} from "react";
import {usePathname} from "next/navigation";
import {useI18n} from "@oskar-lab/i18n/I18nProvider";
import styles from "./UserMenu.module.css";

/** Shows platform login, onboarding and an accessible account disclosure. */
export default function UserMenu() {
    const {data: session, status} = useSession();
    const [open, setOpen] = useState(false);
    const {t} = useI18n();
    const pathname = usePathname();
    const returnTo = `${process.env.NEXT_PUBLIC_APP_BASE_PATH ?? ""}${pathname === "/" ? "" : pathname}` || "/";
    if (status === "loading") return <div className={styles.skeleton} aria-label={t("auth.loading")} />;
    if (!session?.user.complete) return <a className={styles.loginButton} href={`/account?returnTo=${encodeURIComponent(returnTo)}`} aria-label={t("auth.signIn")}><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 9a8 8 0 0 1 16 0Z" /></svg><span>{t(session ? "auth.finishAccount" : "auth.signIn")}</span></a>;
    const displayName = session.user.name ?? t("auth.account");
    return <div className={styles.account} onKeyDown={event => {if (event.key === "Escape") setOpen(false);}}>
        <button type="button" className={styles.profileButton} aria-label={t("auth.accountFor", {name: displayName})} aria-expanded={open} onClick={() => setOpen(!open)}>{displayName[0]?.toUpperCase()}</button>
        {open && <div className={styles.panel}>
            <div className={styles.profileSummary}><strong>{displayName}</strong><span>{session.user.email}</span></div>
            <a href="/account">{t("auth.account")}</a>
            <button type="button" onClick={() => signOut({redirectTo: "/"})}>{t("auth.signOut")}</button>
        </div>}
    </div>;
}
