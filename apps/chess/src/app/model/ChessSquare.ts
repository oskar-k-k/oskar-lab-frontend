import {ChessPiece} from "@/app/model/ChessPiece";
import {Vector} from "@oskar-lab/core/Vector";

export class ChessSquare {
    private piece: ChessPiece | null = null;

    constructor(
        public readonly pos: Vector,
    ) {}

    getPiece(): ChessPiece | null {
        return this.piece;
    }

    setPiece(piece: ChessPiece | null): void {
        this.piece = piece;
    }
}
