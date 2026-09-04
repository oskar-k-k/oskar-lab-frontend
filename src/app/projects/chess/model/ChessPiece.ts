import type {ChessBoard} from "@/app/projects/chess/model/ChessBoard";
import type {ChessSquare} from "@/app/projects/chess/model/ChessSquare";

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

export abstract class ChessPiece {
    abstract readonly kind: PieceKind;
    hasMoved = false;

    protected constructor(public readonly color: ChessColor) {}

    abstract getPseudoLegalTargets(board: ChessBoard, square: ChessSquare): ChessSquare[];

    getAttackSquares(board: ChessBoard, square: ChessSquare): ChessSquare[] {
        return this.getPseudoLegalTargets(board, square);
    }
}
