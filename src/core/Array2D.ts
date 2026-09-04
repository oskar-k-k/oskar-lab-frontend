import {vec, Vector, VectorLike} from "@/core/Vector";

export class Array2D<T> {
    private readonly data: T[];

    private constructor(
        public readonly width: number,
        public readonly height: number,
        data: T[],
    ) {
        if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
            throw new RangeError("Array2D dimensions must be positive integers.");
        }

        if (data.length !== width * height) {
            throw new RangeError("Array2D data does not match its dimensions.");
        }

        this.data = data;
    }

    static create<T>(width: number, height: number, factory: (position: Vector) => T): Array2D<T> {
        const data: T[] = [];

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                data.push(factory(vec(x, y)));
            }
        }

        return new Array2D(width, height, data);
    }

    static createFill<T>(width: number, height: number, value: T): Array2D<T> {
        return Array2D.create(width, height, () => value);
    }

    get(position: VectorLike): T {
        this.assertValid(position);
        return this.data[this.getIndex(position)];
    }

    tryGet(position: VectorLike): T | undefined {
        return this.isValid(position) ? this.data[this.getIndex(position)] : undefined;
    }

    set(position: VectorLike, value: T): void {
        this.assertValid(position);
        this.data[this.getIndex(position)] = value;
    }

    forEachRow(y: number, callback: (x: number, value: T) => void): void {
        if (!Number.isInteger(y) || y < 0 || y >= this.height) {
            throw new RangeError(`Row ${y} is outside Array2D.`);
        }

        for (let x = 0; x < this.width; x++) {
            callback(x, this.get(vec(x, y)));
        }
    }

    forEachColumn(x: number, callback: (y: number, value: T) => void): void {
        if (!Number.isInteger(x) || x < 0 || x >= this.width) {
            throw new RangeError(`Column ${x} is outside Array2D.`);
        }

        for (let y = 0; y < this.height; y++) {
            callback(y, this.get(vec(x, y)));
        }
    }

    forEach(callback: (position: Vector, value: T) => void): void {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const position = vec(x, y);
                callback(position, this.get(position));
            }
        }
    }

    map<R>(callback: (position: Vector, value: T) => R): R[] {
        const result: R[] = [];
        this.forEach((position, value) => result.push(callback(position, value)));
        return result;
    }

    values(): T[] {
        return [...this.data];
    }

    isValid(position: VectorLike): boolean {
        return (
            Number.isInteger(position.x) &&
            Number.isInteger(position.y) &&
            position.x >= 0 &&
            position.y >= 0 &&
            position.x < this.width &&
            position.y < this.height
        );
    }

    private getIndex(position: VectorLike): number {
        return position.y * this.width + position.x;
    }

    private assertValid(position: VectorLike): void {
        if (!this.isValid(position)) {
            throw new RangeError(`Position ${position.x},${position.y} is outside Array2D.`);
        }
    }
}
