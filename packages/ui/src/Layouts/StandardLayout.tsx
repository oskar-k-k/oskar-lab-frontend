import styles from "./StandardLayout.module.css";

/** Properties for the standard centered page layout. */
type Props = {
    children: React.ReactNode;
    className?: string;
    maxWidth?: number;
    padding?: number;
};

/** Constrains page content to a configurable width and responsive padding. */
export default function StandardLayout({
                                           children,
                                           className = "",
                                           maxWidth = 1400,
                                           padding = 32,
                                       }: Props) {
    return (
        <main
            className={`${styles.layout} ${className}`}
            style={{
                "--layout-max-width": `${maxWidth}px`,
                "--layout-padding": `${padding}px`,
            } as React.CSSProperties}
        >
            {children}
        </main>
    );
}
