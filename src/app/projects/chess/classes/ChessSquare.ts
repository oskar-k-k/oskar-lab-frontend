import {ChessPiece} from "@/app/projects/chess/classes/ChessPiece";
import {Vector} from "@/core/Vector";

export class ChessSquare{
    private piece: ChessPiece | null = null


    constructor(
        public readonly pos: Vector,
    ) {}

    getPiece(): ChessPiece | null{
        return this.piece
    }

    setPiece(piece: ChessPiece) : ChessSquare{
        this.piece = piece
        return this
    }
}