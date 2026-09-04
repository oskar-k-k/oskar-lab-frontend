"use client";

import Grid from "@/components/Grids/Grid";
import {ChessBoard, GameStatus} from "@/app/projects/chess/classes/ChessBoard";
import ChessSquareView from "@/app/projects/chess/views/ChessSqaureView";
import {ChessSquare} from "@/app/projects/chess/classes/ChessSquare";
import {ChessPiece, Type} from "@/app/projects/chess/classes/ChessPiece";
import {useState} from "react";
import styles from "./ChessPage.module.css";

const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

type PlayerPanelProps = {
    name: string;
    type: Type;
    active: boolean;
    capturedPieces: ChessPiece[];
    boardVersion: number;
};

function PlayerPanel({name, type, active, capturedPieces, boardVersion}: PlayerPanelProps) {
    return (
        <section
            className={`${styles.playerPanel} ${active ? styles.activePlayer : ""}`}
            data-board-version={boardVersion}
        >
            <div className={`${styles.avatar} ${type === Type.WHITE ? styles.whiteAvatar : styles.blackAvatar}`}>
                {type === Type.WHITE ? "W" : "S"}
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
                    {capturedPieces.map((piece, index) => {
                        const Icon = piece.icon;

                        return (
                            <Icon
                                key={`${piece.name}-${index}`}
                                className={styles.capturedIcon}
                                color={piece.type === Type.WHITE ? "#f8fafc" : "#172033"}
                                aria-label={piece.name}
                            />
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export default function ChessPage() {
    const [board] = useState(() => new ChessBoard());
    const [selectedSquare, setSelectedSquare] = useState<ChessSquare | null>(null);
    const [possibleMoves, setPossibleMoves] = useState<ChessSquare[]>([]);
    const [boardVersion, setBoardVersion] = useState(0);


    function resetSelection(){
        setSelectedSquare(null);
        setPossibleMoves([]);
    }

    function handleClick(square:ChessSquare){
        if (board.status === GameStatus.CHECKMATE || board.status === GameStatus.STALEMATE) {
            return;
        }

        if (selectedSquare && possibleMoves.includes(square)) {
            board.move(selectedSquare, square);
            resetSelection()
            setBoardVersion(version => version + 1);
            return;
        }

        const piece = square.getPiece();
        const canSelect = piece?.type === board.currentTurn;

        setSelectedSquare(canSelect ? square : null);
        setPossibleMoves(canSelect ? board.getPossibleMoves(square) : []);
    }

    function getStatusText(): string {
        const player = board.currentTurn === Type.WHITE ? "Weiß" : "Schwarz";

        switch (board.status) {
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
                type={Type.BLACK}
                active={board.currentTurn === Type.BLACK}
                capturedPieces={board.capturedPieces[Type.BLACK]}
                boardVersion={boardVersion}
            />

            <div className={styles.status} data-status={GameStatus[board.status].toLowerCase()}>
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
                    {board.squares.map((pos, square) => (
                        <ChessSquareView
                            key={`${pos.toString()}-${boardVersion}`}
                            square={square}
                            selected={selectedSquare === square}
                            possibleMove={possibleMoves.includes(square)}
                            possibleCapture={
                                selectedSquare !== null &&
                                possibleMoves.includes(square) &&
                                board.isCaptureMove(selectedSquare, square)
                            }
                            onClick={handleClick}
                        />
                    ))}
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
                type={Type.WHITE}
                active={board.currentTurn === Type.WHITE}
                capturedPieces={board.capturedPieces[Type.WHITE]}
                boardVersion={boardVersion}
            />
        </div>
    );
}
