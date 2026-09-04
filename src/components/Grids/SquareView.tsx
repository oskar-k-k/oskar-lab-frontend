type Props = {
    children?: React.ReactNode;
    className?: string;
    onClick?: () => void;
    color?: string;
    style?: React.CSSProperties;
    ariaLabel?: string;
};

export default function Square({
                                   children,
                                   className,
                                   onClick,
                                   color = "#dddddd",
                                   style,
                                   ariaLabel,
                               }: Props) {
    const squareStyle: React.CSSProperties = {
        background: color,
        aspectRatio: "1",
        display: "block",
        width: "100%",
        padding: 0,
        border: 0,
        ...style,
    };

    if (!onClick) {
        return (
            <div className={className} style={squareStyle}>
                {children}
            </div>
        );
    }

    return (
        <button
            type="button"
            className={className}
            onClick={onClick}
            aria-label={ariaLabel}
            style={squareStyle}
        >
            {children}
        </button>
    );
}
