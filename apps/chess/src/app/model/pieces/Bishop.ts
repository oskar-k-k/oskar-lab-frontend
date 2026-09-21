import {ChessColor, ChessPiece, PieceKind} from "@/app/model/ChessPiece";
import type {ChessBoard} from "@/app/model/ChessBoard";
import type {ChessSquare} from "@/app/model/ChessSquare";
import {vec} from "@oskar-lab/core/Vector";

export class Bishop extends ChessPiece {
    readonly kind = PieceKind.BISHOP;

    constructor(color: ChessColor) {
        super(color);
    }

    getPseudoLegalTargets(board: ChessBoard, square: ChessSquare): ChessSquare[] {
        return board.getMovesInDirections(square, [
            vec(-1, -1),
            vec(1, -1),
            vec(1, 1),
            vec(-1, 1),
        ]);
    }
}
