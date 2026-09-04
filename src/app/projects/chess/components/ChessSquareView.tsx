import {ChessSquare} from "@/app/projects/chess/model/ChessSquare";
import {ChessColor, PieceKind} from "@/app/projects/chess/model/ChessPiece";
import Square from "@/components/Grids/SquareView";
import PieceIcon from "@/app/projects/chess/components/PieceIcon";
import styles from "./ChessSquareView.module.css";

export enum SquareState {
    DEFAULT,
    SELECTED,
    POSSIBLE_MOVE,
    POSSIBLE_CAPTURE,
}

type Props = {
    square: ChessSquare;
    piece: Readonly<{kind: PieceKind; color: ChessColor}> | null;
    selected?: boolean;
    possibleMove?: boolean;
    possibleCapture?: boolean;
    onClick?: (square: ChessSquare) => void;
};

export default function ChessSquareView({
                                            square,
                                            piece,
                                            selected = false,
                                            possibleMove = false,
                                            possibleCapture = false,
                                            onClick
                                        }: Props) {
    const file = String.fromCharCode("a".charCodeAt(0) + square.pos.x);
    const rank = 8 - square.pos.y;

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
            ariaLabel={`Feld ${file}${rank}${piece ? `, ${piece.kind}` : ""}`}
        >
            <Square color={overlayColors[state]} className={styles.overlay}>
                {piece && (
                    <PieceIcon
                        kind={piece.kind}
                        color={piece.color}
                        className={styles.piece}
                    />
                )}
            </Square>
        </Square>

    );
}
