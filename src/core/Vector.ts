export type VectorLike = Readonly<{x: number; y: number}>;

/**
 * Ein unveränderlicher zweidimensionaler Vektor für Positionen und Berechnungen.
 * Jede Rechenoperation erzeugt eine neue Instanz.
 */
export class Vector {
    constructor(
        public readonly x: number,
        public readonly y: number,
    ) {
        Object.freeze(this);
    }

    /** Addiert einen Vektor oder Skalar und gibt einen neuen Vector zurück. */
    add(value: VectorLike | number): Vector {
        return typeof value === "number"
            ? new Vector(this.x + value, this.y + value)
            : new Vector(this.x + value.x, this.y + value.y);
    }

    subtract(value: VectorLike | number): Vector {
        return typeof value === "number"
            ? new Vector(this.x - value, this.y - value)
            : new Vector(this.x - value.x, this.y - value.y);
    }

    multiply(value: VectorLike | number): Vector {
        return typeof value === "number"
            ? new Vector(this.x * value, this.y * value)
            : new Vector(this.x * value.x, this.y * value.y);
    }

    divide(value: VectorLike | number): Vector {
        return typeof value === "number"
            ? new Vector(this.x / value, this.y / value)
            : new Vector(this.x / value.x, this.y / value.y);
    }

    equals(other: VectorLike): boolean {
        return this.x === other.x && this.y === other.y;
    }

    isZero(): boolean {
        return this.x === 0 && this.y === 0;
    }

    get length(): number {
        return Math.hypot(this.x, this.y);
    }

    /** Gibt einen Vektor mit der Länge 1 zurück; ZERO bleibt ZERO. */
    normalize(): Vector {
        return this.length === 0 ? Vector.ZERO : this.divide(this.length);
    }

    getSum(): number {
        return this.x + this.y;
    }

    toString(): string {
        return `${this.x}-${this.y}`;
    }

    toJSON(): VectorLike {
        return {x: this.x, y: this.y};
    }

    static readonly ZERO = new Vector(0, 0);
}

/** Kurze Factory-Funktion für einen neuen Vector. */
export function vec(x: number, y: number): Vector {
    return new Vector(x, y);
}
