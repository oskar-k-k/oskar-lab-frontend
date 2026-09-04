import {ComponentType, SVGProps} from "react";
import type {ChessBoard} from "@/app/projects/chess/classes/ChessBoard";
import type {ChessSquare} from "@/app/projects/chess/classes/ChessSquare";

export enum Type{
    WHITE,
    BLACK
}

export abstract class ChessPiece {
    abstract readonly name: string;
    abstract readonly icon: ComponentType<SVGProps<SVGSVGElement>>;
    abstract getPossibleMoves(board: ChessBoard, square: ChessSquare): ChessSquare[];
    getAttackSquares(board: ChessBoard, square: ChessSquare): ChessSquare[] {
        return this.getPossibleMoves(board, square);
    }
    type: Type
    hasMoved = false;

    constructor(type: Type){
        this.type = type
    }

}
