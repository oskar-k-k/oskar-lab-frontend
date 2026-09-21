import {SVGProps} from "react";
import {ChessColor, PieceKind} from "@/app/model/ChessPiece";
import {BishopIcon} from "@/app/icons/BishopIcon";
import {KingIcon} from "@/app/icons/KingIcon";
import {KnightIcon} from "@/app/icons/KnightIcon";
import {PawnIcon} from "@/app/icons/PawnIcon";
import {QueenIcon} from "@/app/icons/QueenIcon";
import {RookIcon} from "@/app/icons/RookIcon";

const icons = {
    [PieceKind.PAWN]: PawnIcon,
    [PieceKind.ROOK]: RookIcon,
    [PieceKind.KNIGHT]: KnightIcon,
    [PieceKind.BISHOP]: BishopIcon,
    [PieceKind.QUEEN]: QueenIcon,
    [PieceKind.KING]: KingIcon,
};

type Props = SVGProps<SVGSVGElement> & {
    kind: PieceKind;
    color: ChessColor;
};

export default function PieceIcon({kind, color, ...props}: Props) {
    const Icon = icons[kind];
    return <Icon color={color === ChessColor.WHITE ? "#f8fafc" : "#172033"} {...props} />;
}
