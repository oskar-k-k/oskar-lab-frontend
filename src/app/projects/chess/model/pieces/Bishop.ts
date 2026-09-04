import {ChessColor, ChessPiece, PieceKind} from "@/app/projects/chess/model/ChessPiece";
import type {ChessBoard} from "@/app/projects/chess/model/ChessBoard";
import type {ChessSquare} from "@/app/projects/chess/model/ChessSquare";
import {vec} from "@/core/Vector";

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
