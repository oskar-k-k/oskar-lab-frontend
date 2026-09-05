"use client";

import Link from "next/link";
import styles from "./Header.module.css";
import {usePathname} from "next/navigation";
import LanguageSwitch from "@/components/LanguageSwitch/LanguageSwitch";
import {useI18n} from "@/lib/i18n/I18nProvider";

/** Properties for the shared project header and its optional slots. */
type Props = {
    projectName: string;
    center?: React.ReactNode;
    /** Compact status text shown before the right-side controls. */
    status?: React.ReactNode;
    /** Full accessible description for compact status text. */
    statusLabel?: string;
    right?: React.ReactNode;
};

/** Displays the current project and navigation back to the project overview. */
export default function Header({
                                   projectName,
                                   center,
                                   status,
                                   statusLabel,
                                   right,
                               }: Props) {
    const pathname = usePathname();
    const {t} = useI18n();

    const isRoot = pathname === "/";

    return (
        <header className={styles.header}>
            <div className={styles.left}>
                {!isRoot && (
                    <Link href="/" className={styles.back} aria-label={t("common.projects")}>
                        <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m14.5 5-7 7 7 7" /></svg>
                    </Link>
                )}
                <span className={styles.brand} aria-hidden="true"><span>O</span></span>
                <span className={styles.identity}>
                    <span className={styles.eyebrow}>Oskar Lab</span>
                    <span className={styles.title}>{projectName}</span>
                </span>
            </div>

            <div className={styles.content}>
                {center}
            </div>

            <div className={styles.right}>
                {status && <div role="status" aria-label={statusLabel} title={statusLabel} className={styles.status}>{status}</div>}
                {right}
                <LanguageSwitch />
            </div>
        </header>
    );
}
