import {ChessColor, ChessPiece, PieceKind} from "@/app/model/ChessPiece";
import type {ChessBoard} from "@/app/model/ChessBoard";
import type {ChessSquare} from "@/app/model/ChessSquare";
import {vec} from "@oskar-lab/core/Vector";

export class Pawn extends ChessPiece{
    readonly kind = PieceKind.PAWN;

    constructor(color: ChessColor){
        super(color)
    }

    getPseudoLegalTargets(board: ChessBoard, square: ChessSquare): ChessSquare[] {
        const direction = this.color === ChessColor.WHITE ? -1 : 1;
        const startRow = this.color === ChessColor.WHITE ? 6 : 1;
        const moves: ChessSquare[] = [];
        const firstPosition = square.pos.add(vec(0, direction));

        if (board.squares.isValid(firstPosition)) {
            const firstSquare = board.squares.get(firstPosition);

            if (firstSquare.getPiece() === null) {
                moves.push(firstSquare);

                if (!this.hasMoved && square.pos.y === startRow) {
                    const secondPosition = square.pos.add(vec(0, direction * 2));
                    const secondSquare = board.squares.get(secondPosition);

                    if (secondSquare.getPiece() === null) {
                        moves.push(secondSquare);
                    }
                }
            }
        }

        return this.addCaptureMoves(board, square, direction, moves);
    }

    getAttackSquares(board: ChessBoard, square: ChessSquare): ChessSquare[] {
        const direction = this.color === ChessColor.WHITE ? -1 : 1;
        const attacks: ChessSquare[] = [];

        for (const xDirection of [-1, 1]) {
            const targetPosition = square.pos.add(vec(xDirection, direction));

            if (board.squares.isValid(targetPosition)) {
                attacks.push(board.squares.get(targetPosition));
            }
        }

        return attacks;
    }

    private addCaptureMoves(
        board: ChessBoard,
        square: ChessSquare,
        direction: number,
        moves: ChessSquare[],
    ): ChessSquare[] {
        for (const xDirection of [-1, 1]) {
            const targetPosition = square.pos.add(vec(xDirection, direction));

            if (!board.squares.isValid(targetPosition)) {
                continue;
            }

            const targetSquare = board.squares.get(targetPosition);
            const targetPiece = targetSquare.getPiece();

            if (targetPiece && targetPiece.color !== this.color) {
                moves.push(targetSquare);
            } else if (!targetPiece && board.enPassantTarget === targetSquare) {
                moves.push(targetSquare);
            }
        }

        return moves;
    }
}
