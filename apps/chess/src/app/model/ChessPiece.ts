import type {ChessBoard} from "@/app/model/ChessBoard";
import type {ChessSquare} from "@/app/model/ChessSquare";

export enum ChessColor {
    WHITE = "white",
    BLACK = "black",
}

export enum PieceKind {
    PAWN = "pawn",
    ROOK = "rook",
    KNIGHT = "knight",
    BISHOP = "bishop",
    QUEEN = "queen",
    KING = "king",
}

/** Base behavior shared by every chess piece. */
export abstract class ChessPiece {
    abstract readonly kind: PieceKind;
    private moved = false;

    protected constructor(public readonly color: ChessColor) {}

    get hasMoved(): boolean {
        return this.moved;
    }

    /** Marks the piece as moved for rules such as castling and pawn advances. */
    markAsMoved(): void {
        this.moved = true;
    }

    /** Returns movement targets before king-safety validation. */
    abstract getPseudoLegalTargets(board: ChessBoard, square: ChessSquare): ChessSquare[];

    /** Returns all squares currently attacked by this piece. */
    getAttackSquares(board: ChessBoard, square: ChessSquare): ChessSquare[] {
        return this.getPseudoLegalTargets(board, square);
    }
}
