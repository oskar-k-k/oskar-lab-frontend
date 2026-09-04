import {ChessPiece, Type} from "@/app/projects/chess/classes/ChessPiece";
import {QueenIcon} from "@/app/projects/chess/icons/QueenIcon";
import type {ChessBoard} from "@/app/projects/chess/classes/ChessBoard";
import type {ChessSquare} from "@/app/projects/chess/classes/ChessSquare";
import {vec} from "@/core/Vector";

export class Queen extends ChessPiece {
    readonly name = "Queen";
    readonly icon = QueenIcon;

    constructor(type: Type) {
        super(type);
    }

    getPossibleMoves(board: ChessBoard, square: ChessSquare): ChessSquare[] {
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
