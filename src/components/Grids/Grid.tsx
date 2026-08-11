import styles from "./Grid.module.css";

type Props = {
    children: React.ReactNode;
    className?: string;
    gap?: number;
    cardWidth?: number;
    rows?: number;
    cols?: number;
};

export default function Grid({
                                 children,
                                 className = "",
                                 gap = 24,
                                 cardWidth = 260,
                                 rows,
                                 cols,
                             }: Props) {
    return (
        <div
            className={`${styles.grid} ${className}`}
            style={{
                "--grid-gap": `${gap}px`,
                "--grid-card-width": `${cardWidth}px`,

                ...(cols && {
                    gridTemplateColumns: `repeat(${cols}, 1fr)`
                }),

                ...(rows && {
                    gridTemplateRows: `repeat(${rows}, 1fr)`
                }),
            } as React.CSSProperties}
        >
            {children}
        </div>
    );
}