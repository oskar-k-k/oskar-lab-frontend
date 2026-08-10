import styles from "./Grid.module.css";

type Props = {
    children: React.ReactNode;
    className?: string;
    gap?: number;
    cardWidth?: number;
};

export default function Grid({
                                 children,
                                 className = "",
                                 gap = 24,
                                 cardWidth = 260,
                             }: Props) {
    return (
        <div
            className={`${styles.grid} ${className}`}
            style={{
                "--grid-gap": `${gap}px`,
                "--grid-card-width": `${cardWidth}px`,
            } as React.CSSProperties}
        >
            {children}
        </div>
    );
}