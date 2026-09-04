import {ChessPiece, Type} from "@/app/projects/chess/classes/ChessPiece";
import {BishopIcon} from "@/app/projects/chess/icons/BishopIcon";
import type {ChessBoard} from "@/app/projects/chess/classes/ChessBoard";
import type {ChessSquare} from "@/app/projects/chess/classes/ChessSquare";
import {vec} from "@/core/Vector";

export class Bishop extends ChessPiece {
    readonly name = "Bishop";
    readonly icon = BishopIcon;

    constructor(type: Type) {
        super(type);
    }

    getPossibleMoves(board: ChessBoard, square: ChessSquare): ChessSquare[] {
        return board.getMovesInDirections(square, [
            vec(-1, -1),
            vec(1, -1),
            vec(1, 1),
            vec(-1, 1),
        ]);
    }
}
