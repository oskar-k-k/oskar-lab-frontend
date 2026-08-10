import styles from "./StandardLayout.module.css";
import Header from "@/components/Header/Header";

type Props = {
    children: React.ReactNode;
    className?: string;
    maxWidth?: number;
    padding?: number;
};

export default function StandardLayout({
                                           children,
                                           className = "",
                                           maxWidth = 1400,
                                           padding = 32,
                                       }: Props) {
    return (
        <>
            <main
                className={`${styles.layout} ${className}`}
                style={{
                    "--layout-max-width": `${maxWidth}px`,
                    "--layout-padding": `${padding}px`,
                } as React.CSSProperties}
            >
                {children}
            </main>
        </>
    );
}