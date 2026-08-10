"use client";

import Link from "next/link";
import styles from "./Header.module.css";
import {usePathname} from "next/navigation";

type Props = {
    projectName: string;
    center?: React.ReactNode;
    right?: React.ReactNode;
};

export default function Header({
                                   projectName,
                                   center,
                                   right,
                               }: Props) {
    const pathname = usePathname();

    const isRoot = pathname === "/";

    return (
        <header className={styles.header}>
            <div className={styles.left}>

                {!isRoot && (
                    <>
                        <Link
                            href="/"
                            className={styles.back}
                        >
                            ← Projects
                        </Link>

                        <span className={styles.divider} />
                    </>
                )}

                <span className={styles.title}>
                    {projectName}
                </span>

            </div>

            <div className={styles.content}>
                {center}
            </div>

            <div className={styles.right}>
                {right}
            </div>
        </header>
    );
}