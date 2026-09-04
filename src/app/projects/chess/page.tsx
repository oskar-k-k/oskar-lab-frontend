"use client";

import Grid from "@/components/Grids/Grid";
import {GameStatus} from "@/app/projects/chess/model/ChessBoard";
import {ChessMoveType} from "@/app/projects/chess/model/ChessMove";
import {ChessColor} from "@/app/projects/chess/model/ChessPiece";
import ChessSquareView from "@/app/projects/chess/components/ChessSquareView";
import PlayerPanel from "@/app/projects/chess/components/PlayerPanel";
import {useChessGame} from "@/app/projects/chess/hooks/useChessGame";
import styles from "./ChessPage.module.css";

const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

export default function ChessPage() {
    const {board, legalMoves, selectedSquare, selectSquare, snapshot} = useChessGame();

    function getStatusText(): string {
        const player = snapshot.currentTurn === ChessColor.WHITE ? "Weiß" : "Schwarz";

        switch (snapshot.status) {
            case GameStatus.CHECK:
                return `${player} ist im Schach`;
            case GameStatus.CHECKMATE:
                return `Schachmatt – ${player} hat verloren`;
            case GameStatus.STALEMATE:
                return "Patt – Unentschieden";
            default:
                return `Am Zug: ${player}`;
        }
    }

    return (
        <div className={styles.game}>
            <PlayerPanel
                name="Spieler 2 · Schwarz"
                color={ChessColor.BLACK}
                active={snapshot.currentTurn === ChessColor.BLACK}
                capturedPieces={snapshot.capturedPieces[ChessColor.BLACK]}
            />

            <div className={styles.status} data-status={snapshot.status}>
                {getStatusText()}
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
                name="Spieler 1 · Weiß"
                color={ChessColor.WHITE}
                active={snapshot.currentTurn === ChessColor.WHITE}
                capturedPieces={snapshot.capturedPieces[ChessColor.WHITE]}
            />
        </div>
    );
}
