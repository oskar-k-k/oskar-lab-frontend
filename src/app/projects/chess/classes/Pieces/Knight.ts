import {ChessPiece, Type} from "@/app/projects/chess/classes/ChessPiece";
import {KnightIcon} from "@/app/projects/chess/icons/KnightIcon";
import type {ChessBoard} from "@/app/projects/chess/classes/ChessBoard";
import type {ChessSquare} from "@/app/projects/chess/classes/ChessSquare";
import {vec} from "@/core/Vector";

export class Knight extends ChessPiece {
    readonly name = "Knight";
    readonly icon = KnightIcon;

    constructor(type: Type) {
        super(type);
    }

    getPossibleMoves(board: ChessBoard, square: ChessSquare): ChessSquare[] {
        return board.getMovesInDirections(square, [
            vec(-1, -2),
            vec(1, -2),
            vec(2, -1),
            vec(2, 1),
            vec(1, 2),
            vec(-1, 2),
            vec(-2, 1),
            vec(-2, -1),
        ], 1);
    }
}
