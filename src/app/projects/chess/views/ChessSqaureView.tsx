import { ChessSquare } from "@/app/projects/chess/classes/ChessSquare";
import Square from "@/components/Grids/SquareView";
import {Type} from "@/app/projects/chess/classes/ChessPiece";
import styles from "./ChessSquareView.module.css";

export enum SquareState {
    DEFAULT,
    SELECTED,
    POSSIBLE_MOVE,
    POSSIBLE_CAPTURE,
}

type Props = {
    square: ChessSquare;
    selected?: boolean;
    possibleMove?: boolean;
    possibleCapture?: boolean;
    onClick?: (square: ChessSquare) => void;
};

export default function ChessSquareView({
                                            square,
                                            selected = false,
                                            possibleMove = false,
                                            possibleCapture = false,
                                            onClick
                                        }: Props) {
    const Piece = square.getPiece();
    const Icon = Piece?.icon;

    const isLight = square.pos.getSum() % 2 === 0;
    const state = selected
        ? SquareState.SELECTED
        : possibleCapture
            ? SquareState.POSSIBLE_CAPTURE
            : possibleMove
                ? SquareState.POSSIBLE_MOVE
            : SquareState.DEFAULT;

    const overlayColors: Record<SquareState, string> = {
        [SquareState.DEFAULT]: "transparent",
        [SquareState.SELECTED]: "rgb(59 130 246 / 0.48)",
        [SquareState.POSSIBLE_MOVE]: "rgb(34 197 94 / 0.42)",
        [SquareState.POSSIBLE_CAPTURE]: "rgb(239 68 68 / 0.52)",
    };

    function handleClick(){
        onClick?.(square)
    }

    return (

        <Square
            onClick={handleClick}
            color={isLight ? "#eeeed2" : "#769656"}
            className={styles.square}
        >
            <Square color={overlayColors[state]} className={styles.overlay}>
                {Icon && (
                    <Icon
                        className={styles.piece}
                        color={Piece.type === Type.WHITE ? "#f8fafc" : "#172033"}
                    />
                )}
            </Square>
        </Square>

    );
}
