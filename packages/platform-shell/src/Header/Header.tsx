"use client";

import styles from "./Header.module.css";
import {usePathname} from "next/navigation";
import UserMenu from "@oskar-lab/platform-shell/Auth/UserMenu";
import LanguageSwitch from "@oskar-lab/ui/LanguageSwitch/LanguageSwitch";
import {useI18n} from "@oskar-lab/i18n/I18nProvider";

/** Properties for the shared app header and its optional slots. */
type Props = {
    appName: string;
    center?: React.ReactNode;
    /** Compact status text shown before the right-side controls. */
    status?: React.ReactNode;
    /** Full accessible description for compact status text. */
    statusLabel?: string;
    right?: React.ReactNode;
};

/** Displays the current app and navigation back to the app overview. */
export default function Header({
                                   appName,
                                   center,
                                   status,
                                   statusLabel,
                                   right,
                               }: Props) {
    const pathname = usePathname();
    const {t} = useI18n();

    const isRoot = pathname === "/" && appName === t("common.apps");
    if (process.env.NEXT_PUBLIC_PLATFORM_SHELL === "standalone") return null;

    return (
        <header className={styles.header}>
            <div className={styles.left}>
                {!isRoot && (
                    <a href={process.env.NEXT_PUBLIC_PLATFORM_URL || "/"} className={styles.back} aria-label={t("common.apps")}>
                        <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m14.5 5-7 7 7 7" /></svg>
                    </a>
                )}
                <span className={styles.brand} aria-hidden="true"><span>O</span></span>
                <span className={styles.identity}>
                    <span className={styles.eyebrow}>Oskar Lab</span>
                    <span className={styles.title}>{appName}</span>
                </span>
                {status && <div role="status" aria-label={statusLabel} title={statusLabel} className={styles.status}>{status}</div>}
            </div>

            <div className={styles.content}>
                {center}
            </div>

            <div className={styles.right}>
                {right}
                <UserMenu />
                <LanguageSwitch />
            </div>
        </header>
    );
}
