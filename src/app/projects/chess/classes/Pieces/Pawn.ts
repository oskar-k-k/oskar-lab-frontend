import {ChessPiece, Type} from "@/app/projects/chess/classes/ChessPiece";
import {PawnIcon} from "@/app/projects/chess/icons/PawnIcon";

export class Pawn extends ChessPiece{

    readonly name = "Pawn";
    readonly icon = PawnIcon;

    constructor(type: Type){
        super(type)
    }
}