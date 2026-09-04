import { ChessSquare } from "@/app/projects/chess/classes/ChessSquare";
import Square from "@/components/Grids/SquareView";
import {Type} from "@/app/projects/chess/classes/ChessPiece";

type Props = {
    square: ChessSquare;
    selected?: boolean;
    onClick?: (square: ChessSquare) => void;
};

export default function ChessSquareView({
                                            square,
                                            selected = false,
                                            onClick
                                        }: Props) {
    const Piece = square.getPiece();
    const Icon = Piece?.icon;

    const isLight = square.pos.getSum() % 2 === 0;

    function handleClick(){
        onClick?.(square)
    }

    return (

        <Square
            onClick={handleClick}
            color={isLight ? "#eeeed2" : "#769656"}
        >
            <Square color={selected ? "#0000ff55" : "#00000000"}>
                {Icon && <Icon color={Piece.type === Type.WHITE ? "#dddddd" : "#222222"}/>}
            </Square>
        </Square>

    );
}