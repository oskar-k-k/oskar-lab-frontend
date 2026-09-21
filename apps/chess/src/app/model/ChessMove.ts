import {Vector} from "@oskar-lab/core/Vector";
import {PieceKind} from "@/app/model/ChessPiece";

export enum ChessMoveType {
    NORMAL = "normal",
    CAPTURE = "capture",
    CASTLING = "castling",
    EN_PASSANT = "en-passant",
    PROMOTION = "promotion",
}

export type PromotionPieceKind =
    | PieceKind.QUEEN
    | PieceKind.ROOK
    | PieceKind.BISHOP
    | PieceKind.KNIGHT;

export type ChessMove = Readonly<{
    from: Vector;
    to: Vector;
    type: ChessMoveType;
    promotion?: PromotionPieceKind;
}>;

export type ChessMoveCommand = Readonly<{
    from: Readonly<{x: number; y: number}>;
    to: Readonly<{x: number; y: number}>;
    promotion?: PromotionPieceKind;
}>;
