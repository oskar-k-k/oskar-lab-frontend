type Props = {
    children?: React.ReactNode;
    className?: string;
    onClick?: () => void;
    color?: string;
};

export default function Square({
                                   children,
                                   className,
                                   onClick,
                                   color = "#dddddd"
                               }: Props) {
    return (
        <div
            className={className}
            onClick={onClick}
            style={{
                background: color,
                aspectRatio: "1"
            }}
        >
            {children}
        </div>
    );
}