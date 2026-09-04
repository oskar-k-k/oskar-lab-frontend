"use client";

import {useState} from "react";
import {ChessBoard, GameStatus} from "@/app/projects/chess/model/ChessBoard";
import {ChessMove} from "@/app/projects/chess/model/ChessMove";
import {ChessSquare} from "@/app/projects/chess/model/ChessSquare";

export function useChessGame() {
    const [board, setBoard] = useState(() => new ChessBoard());
    const [snapshot, setSnapshot] = useState(() => board.toSnapshot());
    const [selectedSquare, setSelectedSquare] = useState<ChessSquare | null>(null);
    const [legalMoves, setLegalMoves] = useState<ChessMove[]>([]);

    function clearSelection(): void {
        setSelectedSquare(null);
        setLegalMoves([]);
    }

    function selectSquare(square: ChessSquare): void {
        if (board.status === GameStatus.CHECKMATE || board.status === GameStatus.STALEMATE) {
            return;
        }

        const selectedMove = legalMoves.find(move => move.to.equals(square.pos));

        if (selectedSquare && selectedMove) {
            if (board.playMove(selectedMove)) {
                clearSelection();
                setSnapshot(board.toSnapshot());
            }
            return;
        }

        const piece = square.getPiece();
        const canSelect = piece?.color === board.currentTurn;
        setSelectedSquare(canSelect ? square : null);
        setLegalMoves(canSelect ? board.getLegalMoves(square) : []);
    }

    function resetGame(): void {
        const nextBoard = new ChessBoard();
        setBoard(nextBoard);
        setSnapshot(nextBoard.toSnapshot());
        clearSelection();
    }

    return {
        board,
        legalMoves,
        resetGame,
        selectedSquare,
        selectSquare,
        snapshot,
    };
}
