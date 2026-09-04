import {Array2D} from "@/core/Array2D";
import {ChessPiece, Type} from "@/app/projects/chess/classes/ChessPiece";
import {Pawn} from "@/app/projects/chess/classes/Pieces/Pawn";
import {ChessSquare} from "@/app/projects/chess/classes/ChessSquare";
import {Rook} from "@/app/projects/chess/classes/Pieces/Rook";
import {Knight} from "@/app/projects/chess/classes/Pieces/Knight";
import {Bishop} from "@/app/projects/chess/classes/Pieces/Bishop";
import {Queen} from "@/app/projects/chess/classes/Pieces/Queen";
import {King} from "@/app/projects/chess/classes/Pieces/King";
import {vec, Vector} from "@/core/Vector";

export enum GameStatus {
    ACTIVE,
    CHECK,
    CHECKMATE,
    STALEMATE,
}

export class ChessBoard {
    squares: Array2D<ChessSquare> = Array2D.create(8, 8, (pos) => new ChessSquare(pos));
    currentTurn: Type = Type.WHITE;
    status: GameStatus = GameStatus.ACTIVE;
    enPassantTarget: ChessSquare | null = null;
    capturedPieces: Record<Type, ChessPiece[]> = {
        [Type.WHITE]: [],
        [Type.BLACK]: [],
    };

    constructor(){
        this.setStartPosition()
    }

    setStartPosition(){
        const backRow = [Rook, Knight, Bishop, Queen, King, Bishop, Knight, Rook];

        this.squares.forEachRow(0, (x, square) =>
            square.setPiece(new backRow[x](Type.BLACK))
        )
        this.squares.forEachRow(1, (x, square) =>
            square.setPiece(new Pawn(Type.BLACK))
        )
        this.squares.forEachRow(6, (x, square) =>
            square.setPiece(new Pawn(Type.WHITE))
        )
        this.squares.forEachRow(7, (x, square) =>
            square.setPiece(new backRow[x](Type.WHITE))
        )
    }

    getPossibleMoves(square: ChessSquare): ChessSquare[] {
        const piece = square.getPiece();

        if (!piece || piece.type !== this.currentTurn) {
            return [];
        }

        const moves = piece.getPossibleMoves(this, square);

        if (piece instanceof King) {
            moves.push(...this.getCastlingMoves(square));
        }

        return moves.filter(target => {
            if (target.getPiece() instanceof King) {
                return false;
            }

            const isCastling = piece instanceof King && Math.abs(target.pos.x - square.pos.x) === 2;

            return isCastling
                ? !this.wouldLeaveKingInCheckAfterCastling(square, target)
                : !this.wouldLeaveKingInCheck(square, target);
        });
    }

    isCaptureMove(from: ChessSquare, to: ChessSquare): boolean {
        const piece = from.getPiece();
        const targetPiece = to.getPiece();

        if (piece && targetPiece) {
            return piece.type !== targetPiece.type;
        }

        return piece instanceof Pawn && from.pos.x !== to.pos.x && this.enPassantTarget === to;
    }

    getMovesInDirections(
        square: ChessSquare,
        directions: Vector[],
        maxDistance = 7,
    ): ChessSquare[] {
        const piece = square.getPiece();

        if (!piece) {
            return [];
        }

        const moves: ChessSquare[] = [];

        for (const direction of directions) {
            for (let distance = 1; distance <= maxDistance; distance++) {
                const targetPosition = square.pos
                    .clone()
                    .add(direction.clone().multiplyNum(distance));

                if (!this.squares.isValid(targetPosition)) {
                    break;
                }

                const targetSquare = this.squares.get(targetPosition);
                const targetPiece = targetSquare.getPiece();

                if (!targetPiece) {
                    moves.push(targetSquare);
                    continue;
                }

                if (targetPiece.type !== piece.type) {
                    moves.push(targetSquare);
                }

                break;
            }
        }

        return moves;
    }

    move(from: ChessSquare, to: ChessSquare): boolean {
        const piece = from.getPiece();

        if (!piece || !this.getPossibleMoves(from).includes(to)) {
            return false;
        }

        const isCastling = piece instanceof King && Math.abs(to.pos.x - from.pos.x) === 2;
        const isEnPassant = piece instanceof Pawn && from.pos.x !== to.pos.x && !to.getPiece();
        const capturedPiece = isEnPassant
            ? this.squares.get(vec(to.pos.x, from.pos.y)).getPiece()
            : to.getPiece();

        if (capturedPiece) {
            this.capturedPieces[piece.type] = [
                ...this.capturedPieces[piece.type],
                capturedPiece,
            ];
        }

        if (isEnPassant) {
            this.squares.get(vec(to.pos.x, from.pos.y)).setPiece(null);
        }

        to.setPiece(piece);
        from.setPiece(null);
        piece.hasMoved = true;

        if (isCastling) {
            this.moveCastlingRook(from, to);
        }

        if (piece instanceof Pawn && (to.pos.y === 0 || to.pos.y === 7)) {
            to.setPiece(new Queen(piece.type));
        }

        this.enPassantTarget = null;

        if (piece instanceof Pawn && Math.abs(to.pos.y - from.pos.y) === 2) {
            this.enPassantTarget = this.squares.get(
                vec(from.pos.x, (from.pos.y + to.pos.y) / 2),
            );
        }

        this.currentTurn = this.currentTurn === Type.WHITE ? Type.BLACK : Type.WHITE;
        this.updateStatus();
        return true;
    }

    isInCheck(type: Type): boolean {
        let kingSquare: ChessSquare | null = null;

        this.squares.forEach((position, square) => {
            const piece = square.getPiece();

            if (piece instanceof King && piece.type === type) {
                kingSquare = square;
            }
        });

        return kingSquare !== null && this.isSquareAttacked(
            kingSquare,
            type === Type.WHITE ? Type.BLACK : Type.WHITE,
        );
    }

    private isSquareAttacked(square: ChessSquare, byType: Type): boolean {
        let attacked = false;

        this.squares.forEach((position, attackerSquare) => {
            if (attacked) {
                return;
            }

            const attacker = attackerSquare.getPiece();

            if (
                attacker?.type === byType &&
                attacker.getAttackSquares(this, attackerSquare).includes(square)
            ) {
                attacked = true;
            }
        });

        return attacked;
    }

    private wouldLeaveKingInCheck(from: ChessSquare, to: ChessSquare): boolean {
        const piece = from.getPiece();

        if (!piece) {
            return true;
        }

        const capturedPiece = to.getPiece();
        const enPassantSquare = piece instanceof Pawn && from.pos.x !== to.pos.x && !capturedPiece
            ? this.squares.get(vec(to.pos.x, from.pos.y))
            : null;
        const enPassantPiece = enPassantSquare?.getPiece() ?? null;

        from.setPiece(null);
        to.setPiece(piece);
        enPassantSquare?.setPiece(null);

        const leavesKingInCheck = this.isInCheck(piece.type);

        from.setPiece(piece);
        to.setPiece(capturedPiece);
        enPassantSquare?.setPiece(enPassantPiece);

        return leavesKingInCheck;
    }

    private getCastlingMoves(kingSquare: ChessSquare): ChessSquare[] {
        const king = kingSquare.getPiece();

        if (!(king instanceof King) || king.hasMoved || this.isInCheck(king.type)) {
            return [];
        }

        const moves: ChessSquare[] = [];

        for (const rookX of [0, 7]) {
            const rookSquare = this.squares.get(vec(rookX, kingSquare.pos.y));
            const rook = rookSquare.getPiece();

            if (!(rook instanceof Rook) || rook.type !== king.type || rook.hasMoved) {
                continue;
            }

            const direction = rookX === 0 ? -1 : 1;
            const targetX = kingSquare.pos.x + direction * 2;
            let pathIsClear = true;

            for (let x = kingSquare.pos.x + direction; x !== rookX; x += direction) {
                if (this.squares.get(vec(x, kingSquare.pos.y)).getPiece()) {
                    pathIsClear = false;
                    break;
                }
            }

            const transitSquare = this.squares.get(vec(kingSquare.pos.x + direction, kingSquare.pos.y));
            const targetSquare = this.squares.get(vec(targetX, kingSquare.pos.y));

            if (
                pathIsClear &&
                !this.wouldLeaveKingInCheck(kingSquare, transitSquare) &&
                !this.wouldLeaveKingInCheckAfterCastling(kingSquare, targetSquare)
            ) {
                moves.push(targetSquare);
            }
        }

        return moves;
    }

    private wouldLeaveKingInCheckAfterCastling(from: ChessSquare, to: ChessSquare): boolean {
        const king = from.getPiece();

        if (!(king instanceof King)) {
            return true;
        }

        const kingSide = to.pos.x > from.pos.x;
        const rookFrom = this.squares.get(vec(kingSide ? 7 : 0, from.pos.y));
        const rookTo = this.squares.get(vec(kingSide ? 5 : 3, from.pos.y));
        const rook = rookFrom.getPiece();

        from.setPiece(null);
        to.setPiece(king);
        rookFrom.setPiece(null);
        rookTo.setPiece(rook);

        const leavesKingInCheck = this.isInCheck(king.type);

        from.setPiece(king);
        to.setPiece(null);
        rookFrom.setPiece(rook);
        rookTo.setPiece(null);

        return leavesKingInCheck;
    }

    private moveCastlingRook(from: ChessSquare, to: ChessSquare): void {
        const kingSide = to.pos.x > from.pos.x;
        const rookFrom = this.squares.get(vec(kingSide ? 7 : 0, from.pos.y));
        const rookTo = this.squares.get(vec(kingSide ? 5 : 3, from.pos.y));
        const rook = rookFrom.getPiece();

        rookTo.setPiece(rook);
        rookFrom.setPiece(null);

        if (rook) {
            rook.hasMoved = true;
        }
    }

    private updateStatus(): void {
        const inCheck = this.isInCheck(this.currentTurn);
        let hasLegalMove = false;

        this.squares.forEach((position, square) => {
            if (
                !hasLegalMove &&
                square.getPiece()?.type === this.currentTurn &&
                this.getPossibleMoves(square).length > 0
            ) {
                hasLegalMove = true;
            }
        });

        if (!hasLegalMove) {
            this.status = inCheck ? GameStatus.CHECKMATE : GameStatus.STALEMATE;
        } else {
            this.status = inCheck ? GameStatus.CHECK : GameStatus.ACTIVE;
        }
    }
}
