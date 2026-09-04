import {ChessColor, PieceKind} from "@/app/projects/chess/model/ChessPiece";
import PieceIcon from "@/app/projects/chess/components/PieceIcon";
import styles from "../ChessPage.module.css";

type Props = {
    name: string;
    color: ChessColor;
    active: boolean;
    capturedPieces: ReadonlyArray<Readonly<{kind: PieceKind; color: ChessColor}>>;
};

export default function PlayerPanel({name, color, active, capturedPieces}: Props) {
    return (
        <section
            className={`${styles.playerPanel} ${active ? styles.activePlayer : ""}`}
        >
            <div className={`${styles.avatar} ${color === ChessColor.WHITE ? styles.whiteAvatar : styles.blackAvatar}`}>
                {color === ChessColor.WHITE ? "W" : "S"}
            </div>

            <div className={styles.playerInfo}>
                <div className={styles.playerHeading}>
                    <strong>{name}</strong>
                    {active && <span className={styles.turnBadge}>Am Zug</span>}
                </div>
                <div className={styles.capturedPieces} aria-label={`${name}: geschlagene Figuren`}>
                    {capturedPieces.length === 0 && (
                        <span className={styles.noCaptures}>Noch keine Figuren geschlagen</span>
                    )}
                    {capturedPieces.map((piece, index) => (
                        <PieceIcon
                            key={`${piece.kind}-${index}`}
                            kind={piece.kind}
                            color={piece.color}
                            className={styles.capturedIcon}
                            aria-label={piece.kind}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
