"use client";

import {signIn, signOut, useSession} from "next-auth/react";
import Image from "next/image";
import {useEffect, useState} from "react";
import {useI18n} from "@oskar-lab/i18n/I18nProvider";
import styles from "./UserMenu.module.css";

function UserFallbackIcon() {
    return (
        <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
            <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
    );
}

function GoogleIcon() {
    return (
        <svg aria-hidden="true" viewBox="0 0 24 24">
            <path fill="#4285f4" d="M21.6 12.23c0-.73-.07-1.43-.19-2.11H12v3.99h5.38a4.6 4.6 0 0 1-2 3.02v2.62h3.24c1.9-1.75 2.98-4.32 2.98-7.52Z" />
            <path fill="#34a853" d="M12 22c2.7 0 4.97-.9 6.62-2.43l-3.24-2.52c-.9.6-2.04.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.06v2.68A10 10 0 0 0 12 22Z" />
            <path fill="#fbbc05" d="M6.41 13.89a6 6 0 0 1 0-3.78V7.43H3.06a10 10 0 0 0 0 9.14l3.35-2.68Z" />
            <path fill="#ea4335" d="M12 5.99c1.47 0 2.79.51 3.82 1.5l2.87-2.87A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.94 5.43l3.35 2.68C7.2 7.75 9.4 5.99 12 5.99Z" />
        </svg>
    );
}

/** Shows optional platform sign-in state and Google login controls. */
export default function UserMenu() {
    const {data: session, status} = useSession();
    const [googleAvailable, setGoogleAvailable] = useState<boolean | null>(null);
    const {t} = useI18n();
    const user = session?.user;

    useEffect(() => {
        let active = true;
        fetch("/api/auth/providers")
            .then(response => response.ok ? response.json() : {})
            .then((providers: Record<string, unknown>) => {
                if (active) setGoogleAvailable(Boolean(providers.google));
            })
            .catch(() => {
                if (active) setGoogleAvailable(false);
            });

        return () => {
            active = false;
        };
    }, []);

    if (status === "loading" || googleAvailable === null) {
        return <div className={styles.skeleton} aria-label={t("auth.loading")} />;
    }

    if (!user) {
        if (!googleAvailable) {
            return (
                <button type="button" className={styles.loginButton} disabled title={t("auth.setupRequired")} aria-label={t("auth.setupRequired")}>
                    <GoogleIcon />
                    <span>{t("auth.signIn")}</span>
                </button>
            );
        }

        return (
            <button type="button" className={styles.loginButton} onClick={() => signIn("google")} aria-label={t("auth.signInWithGoogle")}>
                <GoogleIcon />
                <span>{t("auth.signIn")}</span>
            </button>
        );
    }

    const displayName = user.name ?? user.email ?? t("auth.account");

    return (
        <div className={styles.account}>
            <button type="button" className={styles.profileButton} aria-label={t("auth.accountFor", {name: displayName})} title={displayName}>
                {user.image ? <Image src={user.image} alt="" width={38} height={38} unoptimized referrerPolicy="no-referrer" /> : <UserFallbackIcon />}
            </button>
            <div className={styles.panel} role="menu" aria-label={t("auth.account")}>
                <div className={styles.profileSummary}>
                    <strong>{displayName}</strong>
                    {user.email && <span>{user.email}</span>}
                </div>
                <button type="button" role="menuitem" onClick={() => signOut()}>{t("auth.signOut")}</button>
            </div>
        </div>
    );
}
