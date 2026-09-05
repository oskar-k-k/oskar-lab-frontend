"use client";

import Grid from "@/components/Grids/Grid";
import {GameStatus} from "@/app/projects/chess/model/ChessBoard";
import {ChessMoveType} from "@/app/projects/chess/model/ChessMove";
import {ChessColor} from "@/app/projects/chess/model/ChessPiece";
import ChessSquareView from "@/app/projects/chess/components/ChessSquareView";
import PlayerPanel from "@/app/projects/chess/components/PlayerPanel";
import {useChessGame} from "@/app/projects/chess/hooks/useChessGame";
import styles from "./ChessPage.module.css";
import {useI18n} from "@/lib/i18n/I18nProvider";

const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

export default function ChessPage() {
    const {board, legalMoves, resetGame, selectedSquare, selectSquare, snapshot} = useChessGame();
    const {t} = useI18n();

    function getStatusText(): string {
        const player = t(snapshot.currentTurn === ChessColor.WHITE ? "chess.white" : "chess.black");

        switch (snapshot.status) {
            case GameStatus.CHECK:
                return t("chess.inCheck", {player});
            case GameStatus.CHECKMATE:
                return t("chess.checkmate", {player});
            case GameStatus.STALEMATE:
                return t("chess.stalemate");
            default:
                return t("chess.currentTurn", {player});
        }
    }

    return (
        <div className={styles.game}>
            <PlayerPanel
                name={t("chess.playerTwo")}
                color={ChessColor.BLACK}
                active={snapshot.currentTurn === ChessColor.BLACK}
                capturedPieces={snapshot.capturedPieces[ChessColor.BLACK]}
            />

            <div className={styles.gameControls}>
                <div className={styles.status} data-status={snapshot.status} role="status" aria-live="polite">
                    {getStatusText()}
                </div>
                <button className={styles.resetButton} type="button" onClick={resetGame}>
                    {t("chess.newGame")}
                </button>
            </div>

            <div className={styles.boardFrame}>
                <div className={`${styles.fileLabels} ${styles.topFiles}`} aria-hidden="true">
                    {files.map(file => <span key={`top-${file}`}>{file}</span>)}
                </div>
                <div className={`${styles.rankLabels} ${styles.leftRanks}`} aria-hidden="true">
                    {ranks.map(rank => <span key={`left-${rank}`}>{rank}</span>)}
                </div>

                <Grid className={styles.board} cols={8} rows={8} gap={0}>
                    {board.squares.map((position, square) => {
                        const move = legalMoves.find(candidate => candidate.to.equals(position));
                        const piece = snapshot.pieces.find(candidate => (
                            candidate.position.x === position.x && candidate.position.y === position.y
                        )) ?? null;
                        const isCapture = move !== undefined && (
                            move.type === ChessMoveType.CAPTURE ||
                            move.type === ChessMoveType.EN_PASSANT ||
                            piece !== null
                        );

                        return (
                            <ChessSquareView
                                key={position.toString()}
                                square={square}
                                piece={piece}
                                selected={selectedSquare === square}
                                possibleMove={move !== undefined}
                                possibleCapture={isCapture}
                                onClick={selectSquare}
                            />
                        );
                    })}
                </Grid>

                <div className={`${styles.rankLabels} ${styles.rightRanks}`} aria-hidden="true">
                    {ranks.map(rank => <span key={`right-${rank}`}>{rank}</span>)}
                </div>
                <div className={`${styles.fileLabels} ${styles.bottomFiles}`} aria-hidden="true">
                    {files.map(file => <span key={`bottom-${file}`}>{file}</span>)}
                </div>
            </div>

            <PlayerPanel
                name={t("chess.playerOne")}
                color={ChessColor.WHITE}
                active={snapshot.currentTurn === ChessColor.WHITE}
                capturedPieces={snapshot.capturedPieces[ChessColor.WHITE]}
            />
        </div>
    );
}
