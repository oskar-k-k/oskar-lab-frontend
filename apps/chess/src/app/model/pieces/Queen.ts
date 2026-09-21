import {ChessColor, ChessPiece, PieceKind} from "@/app/model/ChessPiece";
import type {ChessBoard} from "@/app/model/ChessBoard";
import type {ChessSquare} from "@/app/model/ChessSquare";
import {vec} from "@oskar-lab/core/Vector";

export class Queen extends ChessPiece {
    readonly kind = PieceKind.QUEEN;

    constructor(color: ChessColor) {
        super(color);
    }

    getPseudoLegalTargets(board: ChessBoard, square: ChessSquare): ChessSquare[] {
        return board.getMovesInDirections(square, [
            vec(0, -1),
            vec(1, -1),
            vec(1, 0),
            vec(1, 1),
            vec(0, 1),
            vec(-1, 1),
            vec(-1, 0),
            vec(-1, -1),
        ]);
    }
}
