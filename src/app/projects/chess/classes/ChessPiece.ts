import {ComponentType, SVGProps} from "react";

export enum Type{
    WHITE,
    BLACK
}

export abstract class ChessPiece {
    abstract readonly name: string;
    abstract readonly icon: ComponentType<SVGProps<SVGSVGElement>>;
    type: Type

    constructor(type: Type){
        this.type = type
    }

}