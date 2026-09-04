import {SVGProps} from "react";
import {ChessColor, PieceKind} from "@/app/projects/chess/model/ChessPiece";
import {BishopIcon} from "@/app/projects/chess/icons/BishopIcon";
import {KingIcon} from "@/app/projects/chess/icons/KingIcon";
import {KnightIcon} from "@/app/projects/chess/icons/KnightIcon";
import {PawnIcon} from "@/app/projects/chess/icons/PawnIcon";
import {QueenIcon} from "@/app/projects/chess/icons/QueenIcon";
import {RookIcon} from "@/app/projects/chess/icons/RookIcon";

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
