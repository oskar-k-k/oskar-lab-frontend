import {ChessColor, PieceKind} from "@/app/model/ChessPiece";
import PieceIcon from "@/app/components/PieceIcon";
import styles from "../ChessPage.module.css";
import {useI18n} from "@oskar-lab/i18n/I18nProvider";

type Props = {
    name: string;
    color: ChessColor;
    active: boolean;
    capturedPieces: ReadonlyArray<Readonly<{kind: PieceKind; color: ChessColor}>>;
};

export default function PlayerPanel({name, color, active, capturedPieces}: Props) {
    const {t} = useI18n();
    return (
        <section
            className={`${styles.playerPanel} ${active ? styles.activePlayer : ""}`}
        >
            <div className={`${styles.avatar} ${color === ChessColor.WHITE ? styles.whiteAvatar : styles.blackAvatar}`}>
                {t(color === ChessColor.WHITE ? "chess.white" : "chess.black").charAt(0)}
            </div>

            <div className={styles.playerInfo}>
                <div className={styles.playerHeading}>
                    <strong>{name}</strong>
                    {active && <span className={styles.turnBadge}>{t("chess.turn")}</span>}
                </div>
                <div className={styles.capturedPieces} aria-label={t("chess.capturedPieces", {player: name})}>
                    {capturedPieces.length === 0 && (
                        <span className={styles.noCaptures}>{t("chess.noCaptures")}</span>
                    )}
                    {capturedPieces.map((piece, index) => (
                        <PieceIcon
                            key={`${piece.kind}-${index}`}
                            kind={piece.kind}
                            color={piece.color}
                            className={styles.capturedIcon}
                            aria-label={t(`chess.${piece.kind}`)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
