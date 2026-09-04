import Link from "next/link";
import {ReactNode} from "react";
import styles from "./Button.module.css";
import { ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    className?: string;
    href?: string;
    onClick?: () => void;
    variant?: "primary" | "secondary";
}

export default function Button({
    children,
    className,
    href,
    onClick,
    variant = "secondary",
    ...props
}: Props) {
    const css = `${styles.button} ${styles[variant]} ${className ?? ""}`;

    if (href) {
        return (
            <Link href={href} className={css}>
                {children}
            </Link>
        );
    }

    return (
        <button
            type="button"
            className={css}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
}
