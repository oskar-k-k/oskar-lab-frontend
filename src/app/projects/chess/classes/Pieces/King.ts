import {ChessPiece, Type} from "@/app/projects/chess/classes/ChessPiece";
import {KingIcon} from "@/app/projects/chess/icons/KingIcon";
import type {ChessBoard} from "@/app/projects/chess/classes/ChessBoard";
import type {ChessSquare} from "@/app/projects/chess/classes/ChessSquare";
import {vec} from "@/core/Vector";

export class King extends ChessPiece {
    readonly name = "King";
    readonly icon = KingIcon;

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
        ], 1);
    }
}
