import {Array2D} from "@/core/Array2D";
import {vec, Vector, VectorLike} from "@/core/Vector";
import {ChessMove, ChessMoveCommand, ChessMoveType} from "@/app/projects/chess/model/ChessMove";
import {ChessColor, ChessPiece, PieceKind} from "@/app/projects/chess/model/ChessPiece";
import {ChessSquare} from "@/app/projects/chess/model/ChessSquare";
import {Bishop} from "@/app/projects/chess/model/pieces/Bishop";
import {King} from "@/app/projects/chess/model/pieces/King";
import {Knight} from "@/app/projects/chess/model/pieces/Knight";
import {Pawn} from "@/app/projects/chess/model/pieces/Pawn";
import {Queen} from "@/app/projects/chess/model/pieces/Queen";
import {Rook} from "@/app/projects/chess/model/pieces/Rook";

export enum GameStatus {
    ACTIVE = "active",
    CHECK = "check",
    CHECKMATE = "checkmate",
    STALEMATE = "stalemate",
}

export type ChessGameSnapshot = Readonly<{
    currentTurn: ChessColor;
    status: GameStatus;
    pieces: ReadonlyArray<Readonly<{
        position: VectorLike;
        color: ChessColor;
        kind: PieceKind;
        hasMoved: boolean;
    }>>;
    enPassantTarget: VectorLike | null;
    capturedPieces: Readonly<Record<ChessColor, ReadonlyArray<Readonly<{
        color: ChessColor;
        kind: PieceKind;
    }>>>>;
    moves: ReadonlyArray<ChessMove>;
}>;

type PieceConstructor = new (color: ChessColor) => ChessPiece;

export class ChessBoard {
    readonly squares = Array2D.create(8, 8, position => new ChessSquare(position));

    private _currentTurn = ChessColor.WHITE;
    private _status = GameStatus.ACTIVE;
    private _enPassantTarget: ChessSquare | null = null;
    private _capturedPieces: Record<ChessColor, ChessPiece[]> = {
        [ChessColor.WHITE]: [],
        [ChessColor.BLACK]: [],
    };
    private _history: ChessMove[] = [];

    constructor() {
        this.setStartPosition();
    }

    get currentTurn(): ChessColor {
        return this._currentTurn;
    }

    get status(): GameStatus {
        return this._status;
    }

    get enPassantTarget(): ChessSquare | null {
        return this._enPassantTarget;
    }

    get history(): readonly ChessMove[] {
        return this._history;
    }

    getCapturedPieces(color: ChessColor): readonly ChessPiece[] {
        return this._capturedPieces[color];
    }

    getLegalMoves(square: ChessSquare): ChessMove[] {
        const piece = square.getPiece();

        if (!piece || piece.color !== this._currentTurn) {
            return [];
        }

        const targets = piece.getPseudoLegalTargets(this, square);

        if (piece instanceof King) {
            targets.push(...this.getCastlingTargets(square));
        }

        return targets
            .filter(target => !(target.getPiece() instanceof King))
            .map(target => this.createMove(square, target))
            .filter(move => !this.wouldLeaveKingInCheck(move));
    }

    playMove(command: ChessMoveCommand): boolean {
        const from = this.squares.tryGet(command.from);

        if (!from || this.isFinished()) {
            return false;
        }

        const move = this.getLegalMoves(from).find(candidate => candidate.to.equals(command.to));

        if (!move) {
            return false;
        }

        const promotion = move.type === ChessMoveType.PROMOTION
            ? command.promotion ?? PieceKind.QUEEN
            : undefined;

        this.applyMove({...move, promotion});
        return true;
    }

    getMovesInDirections(
        square: ChessSquare,
        directions: readonly Vector[],
        maxDistance = 7,
    ): ChessSquare[] {
        const piece = square.getPiece();

        if (!piece) {
            return [];
        }

        const targets: ChessSquare[] = [];

        for (const direction of directions) {
            for (let distance = 1; distance <= maxDistance; distance++) {
                const targetPosition = square.pos.add(direction.multiply(distance));
                const targetSquare = this.squares.tryGet(targetPosition);

                if (!targetSquare) {
                    break;
                }

                const targetPiece = targetSquare.getPiece();

                if (!targetPiece) {
                    targets.push(targetSquare);
                    continue;
                }

                if (targetPiece.color !== piece.color) {
                    targets.push(targetSquare);
                }

                break;
            }
        }

        return targets;
    }

    isInCheck(color: ChessColor): boolean {
        const kingSquare = this.findKing(color);
        return kingSquare ? this.isSquareAttacked(kingSquare, this.oppositeColor(color)) : false;
    }

    toSnapshot(): ChessGameSnapshot {
        const pieces: ChessGameSnapshot["pieces"][number][] = [];

        this.squares.forEach((position, square) => {
            const piece = square.getPiece();

            if (piece) {
                pieces.push({
                    position: position.toJSON(),
                    color: piece.color,
                    kind: piece.kind,
                    hasMoved: piece.hasMoved,
                });
            }
        });

        return {
            currentTurn: this._currentTurn,
            status: this._status,
            pieces,
            enPassantTarget: this._enPassantTarget?.pos.toJSON() ?? null,
            capturedPieces: {
                [ChessColor.WHITE]: this._capturedPieces[ChessColor.WHITE].map(piece => ({
                    color: piece.color,
                    kind: piece.kind,
                })),
                [ChessColor.BLACK]: this._capturedPieces[ChessColor.BLACK].map(piece => ({
                    color: piece.color,
                    kind: piece.kind,
                })),
            },
            moves: [...this._history],
        };
    }

    private setStartPosition(): void {
        const backRow: readonly PieceConstructor[] = [
            Rook,
            Knight,
            Bishop,
            Queen,
            King,
            Bishop,
            Knight,
            Rook,
        ];

        this.squares.forEachRow(0, (x, square) => square.setPiece(new backRow[x](ChessColor.BLACK)));
        this.squares.forEachRow(1, (x, square) => square.setPiece(new Pawn(ChessColor.BLACK)));
        this.squares.forEachRow(6, (x, square) => square.setPiece(new Pawn(ChessColor.WHITE)));
        this.squares.forEachRow(7, (x, square) => square.setPiece(new backRow[x](ChessColor.WHITE)));
    }

    private applyMove(move: ChessMove): void {
        const from = this.squares.get(move.from);
        const to = this.squares.get(move.to);
        const piece = from.getPiece();

        if (!piece) {
            return;
        }

        const capturedSquare = move.type === ChessMoveType.EN_PASSANT
            ? this.squares.get(vec(move.to.x, move.from.y))
            : to;
        const capturedPiece = capturedSquare.getPiece();

        if (capturedPiece) {
            this._capturedPieces[piece.color] = [
                ...this._capturedPieces[piece.color],
                capturedPiece,
            ];
        }

        capturedSquare.setPiece(null);
        from.setPiece(null);
        to.setPiece(piece);
        piece.hasMoved = true;

        if (move.type === ChessMoveType.CASTLING) {
            this.moveCastlingRook(move);
        }

        if (move.type === ChessMoveType.PROMOTION) {
            to.setPiece(this.createPromotionPiece(move.promotion ?? PieceKind.QUEEN, piece.color));
        }

        this._enPassantTarget = null;

        if (piece instanceof Pawn && Math.abs(move.to.y - move.from.y) === 2) {
            this._enPassantTarget = this.squares.get(vec(move.from.x, (move.from.y + move.to.y) / 2));
        }

        this._history = [...this._history, move];
        this._currentTurn = this.oppositeColor(this._currentTurn);
        this.updateStatus();
    }

    private createMove(from: ChessSquare, to: ChessSquare): ChessMove {
        const piece = from.getPiece();

        if (!piece) {
            throw new Error("Cannot create a move from an empty square.");
        }

        if (piece instanceof King && Math.abs(to.pos.x - from.pos.x) === 2) {
            return {from: from.pos, to: to.pos, type: ChessMoveType.CASTLING};
        }

        if (piece instanceof Pawn && (to.pos.y === 0 || to.pos.y === 7)) {
            return {from: from.pos, to: to.pos, type: ChessMoveType.PROMOTION, promotion: PieceKind.QUEEN};
        }

        if (piece instanceof Pawn && from.pos.x !== to.pos.x && !to.getPiece()) {
            return {from: from.pos, to: to.pos, type: ChessMoveType.EN_PASSANT};
        }

        return {
            from: from.pos,
            to: to.pos,
            type: to.getPiece() ? ChessMoveType.CAPTURE : ChessMoveType.NORMAL,
        };
    }

    private wouldLeaveKingInCheck(move: ChessMove): boolean {
        return this.simulateMove(move, () => {
            const piece = this.squares.get(move.to).getPiece();
            return piece ? this.isInCheck(piece.color) : true;
        });
    }

    private simulateMove<T>(move: ChessMove, callback: () => T): T {
        const from = this.squares.get(move.from);
        const to = this.squares.get(move.to);
        const piece = from.getPiece();
        const capturedSquare = move.type === ChessMoveType.EN_PASSANT
            ? this.squares.get(vec(move.to.x, move.from.y))
            : to;
        const capturedPiece = capturedSquare.getPiece();
        const rookSquares = move.type === ChessMoveType.CASTLING
            ? this.getCastlingRookSquares(move)
            : null;
        const rook = rookSquares?.from.getPiece() ?? null;

        from.setPiece(null);
        capturedSquare.setPiece(null);
        to.setPiece(piece);

        if (rookSquares) {
            rookSquares.from.setPiece(null);
            rookSquares.to.setPiece(rook);
        }

        try {
            return callback();
        } finally {
            from.setPiece(piece);
            to.setPiece(move.type === ChessMoveType.EN_PASSANT ? null : capturedPiece);
            capturedSquare.setPiece(capturedPiece);

            if (rookSquares) {
                rookSquares.from.setPiece(rook);
                rookSquares.to.setPiece(null);
            }
        }
    }

    private getCastlingTargets(kingSquare: ChessSquare): ChessSquare[] {
        const king = kingSquare.getPiece();

        if (!(king instanceof King) || king.hasMoved || this.isInCheck(king.color)) {
            return [];
        }

        const targets: ChessSquare[] = [];

        for (const rookX of [0, 7]) {
            const rookSquare = this.squares.get(vec(rookX, kingSquare.pos.y));
            const rook = rookSquare.getPiece();

            if (!(rook instanceof Rook) || rook.color !== king.color || rook.hasMoved) {
                continue;
            }

            const direction = rookX === 0 ? -1 : 1;
            let pathIsClear = true;

            for (let x = kingSquare.pos.x + direction; x !== rookX; x += direction) {
                if (this.squares.get(vec(x, kingSquare.pos.y)).getPiece()) {
                    pathIsClear = false;
                    break;
                }
            }

            if (!pathIsClear) {
                continue;
            }

            const transit = this.squares.get(kingSquare.pos.add(vec(direction, 0)));
            const target = this.squares.get(kingSquare.pos.add(vec(direction * 2, 0)));
            const transitMove: ChessMove = {
                from: kingSquare.pos,
                to: transit.pos,
                type: ChessMoveType.NORMAL,
            };
            const castlingMove: ChessMove = {
                from: kingSquare.pos,
                to: target.pos,
                type: ChessMoveType.CASTLING,
            };

            if (!this.wouldLeaveKingInCheck(transitMove) && !this.wouldLeaveKingInCheck(castlingMove)) {
                targets.push(target);
            }
        }

        return targets;
    }

    private getCastlingRookSquares(move: ChessMove): {from: ChessSquare; to: ChessSquare} {
        const kingSide = move.to.x > move.from.x;
        return {
            from: this.squares.get(vec(kingSide ? 7 : 0, move.from.y)),
            to: this.squares.get(vec(kingSide ? 5 : 3, move.from.y)),
        };
    }

    private moveCastlingRook(move: ChessMove): void {
        const rookSquares = this.getCastlingRookSquares(move);
        const rook = rookSquares.from.getPiece();
        rookSquares.from.setPiece(null);
        rookSquares.to.setPiece(rook);

        if (rook) {
            rook.hasMoved = true;
        }
    }

    private createPromotionPiece(kind: PieceKind, color: ChessColor): ChessPiece {
        switch (kind) {
            case PieceKind.ROOK:
                return new Rook(color);
            case PieceKind.BISHOP:
                return new Bishop(color);
            case PieceKind.KNIGHT:
                return new Knight(color);
            default:
                return new Queen(color);
        }
    }

    private isSquareAttacked(square: ChessSquare, byColor: ChessColor): boolean {
        let attacked = false;

        this.squares.forEach((position, attackerSquare) => {
            const attacker = attackerSquare.getPiece();

            if (
                !attacked &&
                attacker?.color === byColor &&
                attacker.getAttackSquares(this, attackerSquare).includes(square)
            ) {
                attacked = true;
            }
        });

        return attacked;
    }

    private findKing(color: ChessColor): ChessSquare | null {
        let kingSquare: ChessSquare | null = null;

        this.squares.forEach((position, square) => {
            const piece = square.getPiece();

            if (piece instanceof King && piece.color === color) {
                kingSquare = square;
            }
        });

        return kingSquare;
    }

    private updateStatus(): void {
        const inCheck = this.isInCheck(this._currentTurn);
        let hasLegalMove = false;

        this.squares.forEach((position, square) => {
            if (
                !hasLegalMove &&
                square.getPiece()?.color === this._currentTurn &&
                this.getLegalMoves(square).length > 0
            ) {
                hasLegalMove = true;
            }
        });

        this._status = hasLegalMove
            ? inCheck ? GameStatus.CHECK : GameStatus.ACTIVE
            : inCheck ? GameStatus.CHECKMATE : GameStatus.STALEMATE;
    }

    private isFinished(): boolean {
        return this._status === GameStatus.CHECKMATE || this._status === GameStatus.STALEMATE;
    }

    private oppositeColor(color: ChessColor): ChessColor {
        return color === ChessColor.WHITE ? ChessColor.BLACK : ChessColor.WHITE;
    }
}
