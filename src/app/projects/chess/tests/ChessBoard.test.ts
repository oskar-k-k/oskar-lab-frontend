import {describe, expect, it} from "vitest";
import {vec} from "@/core/Vector";
import {ChessBoard, GameStatus} from "@/app/projects/chess/model/ChessBoard";
import {ChessMoveType, PromotionPieceKind} from "@/app/projects/chess/model/ChessMove";
import {ChessColor, PieceKind} from "@/app/projects/chess/model/ChessPiece";

const move = (
    board: ChessBoard,
    from: [number, number],
    to: [number, number],
    promotion?: PromotionPieceKind,
) => board.playMove({from: vec(...from), to: vec(...to), promotion});

describe("ChessBoard", () => {
    it("starts with a serializable standard position", () => {
        const board = new ChessBoard();
        const snapshot = board.toSnapshot();

        expect(snapshot.currentTurn).toBe(ChessColor.WHITE);
        expect(snapshot.pieces).toHaveLength(32);
        expect(() => JSON.stringify(snapshot)).not.toThrow();
    });

    it("moves pawns two squares initially and alternates turns", () => {
        const board = new ChessBoard();

        expect(move(board, [4, 6], [4, 4])).toBe(true);
        expect(board.currentTurn).toBe(ChessColor.BLACK);
        expect(move(board, [3, 6], [3, 5])).toBe(false);
    });

    it("supports en passant and records the captured pawn", () => {
        const board = new ChessBoard();

        move(board, [4, 6], [4, 4]);
        move(board, [0, 1], [0, 2]);
        move(board, [4, 4], [4, 3]);
        move(board, [3, 1], [3, 3]);

        expect(move(board, [4, 3], [3, 2])).toBe(true);
        expect(board.history.at(-1)?.type).toBe(ChessMoveType.EN_PASSANT);
        expect(board.squares.get(vec(3, 3)).getPiece()).toBeNull();
        expect(board.getCapturedPieces(ChessColor.WHITE)).toHaveLength(1);
    });

    it("castles king-side after the path is cleared", () => {
        const board = new ChessBoard();

        move(board, [6, 7], [5, 5]);
        move(board, [0, 1], [0, 2]);
        move(board, [4, 6], [4, 5]);
        move(board, [0, 2], [0, 3]);
        move(board, [5, 7], [4, 6]);
        move(board, [1, 1], [1, 2]);

        expect(move(board, [4, 7], [6, 7])).toBe(true);
        expect(board.squares.get(vec(6, 7)).getPiece()?.kind).toBe(PieceKind.KING);
        expect(board.squares.get(vec(5, 7)).getPiece()?.kind).toBe(PieceKind.ROOK);
    });

    it("detects fool's mate", () => {
        const board = new ChessBoard();

        move(board, [5, 6], [5, 5]);
        move(board, [4, 1], [4, 3]);
        move(board, [6, 6], [6, 4]);
        move(board, [3, 0], [7, 4]);

        expect(board.status).toBe(GameStatus.CHECKMATE);
        expect(board.currentTurn).toBe(ChessColor.WHITE);
    });

    it("promotes a pawn to the requested piece", () => {
        const board = new ChessBoard();

        move(board, [0, 6], [0, 4]);
        move(board, [1, 1], [1, 3]);
        move(board, [0, 4], [1, 3]);
        move(board, [2, 1], [2, 2]);
        move(board, [1, 3], [2, 2]);
        move(board, [0, 1], [0, 2]);
        move(board, [2, 2], [2, 1]);
        move(board, [0, 2], [0, 3]);

        expect(move(board, [2, 1], [3, 0], PieceKind.KNIGHT)).toBe(true);
        expect(board.squares.get(vec(3, 0)).getPiece()?.kind).toBe(PieceKind.KNIGHT);
        expect(board.history.at(-1)?.type).toBe(ChessMoveType.PROMOTION);
    });
});
