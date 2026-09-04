import {ChessPiece, Type} from "@/app/projects/chess/classes/ChessPiece";
import {RookIcon} from "@/app/projects/chess/icons/RookIcon";
import type {ChessBoard} from "@/app/projects/chess/classes/ChessBoard";
import type {ChessSquare} from "@/app/projects/chess/classes/ChessSquare";
import {vec} from "@/core/Vector";

export class Rook extends ChessPiece {
    readonly name = "Rook";
    readonly icon = RookIcon;

    constructor(type: Type) {
        super(type);
    }

    getPossibleMoves(board: ChessBoard, square: ChessSquare): ChessSquare[] {
        return board.getMovesInDirections(square, [
            vec(0, -1),
            vec(1, 0),
            vec(0, 1),
            vec(-1, 0),
        ]);
    }
}
