import {Array2D} from "@/core/Array2D";
import {ChessPiece, Type} from "@/app/projects/chess/classes/ChessPiece";
import {Pawn} from "@/app/projects/chess/classes/Pieces/Pawn";
import {ChessSquare} from "@/app/projects/chess/classes/ChessSquare";

export class ChessBoard {
    squares: Array2D<ChessSquare> = Array2D.create(8, 8, (pos) => new ChessSquare(pos));

    constructor(){
        this.setStartPosition()
    }

    setStartPosition(){
        this.squares.forEachRow(1, (x, square) =>
            square.setPiece(new Pawn(Type.BLACK))
        )
        this.squares.forEachRow(6, (x, square) =>
            square.setPiece(new Pawn(Type.WHITE))
        )
    }
}