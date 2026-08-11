export class Array2D<T> {
    private data: T[][];

    constructor(
        public readonly rows: number,
        public readonly cols: number,
        initialValue: T
    ) {
        this.data = Array.from({ length: rows }, () =>
            Array.from({ length: cols }, () => initialValue)
        );
    }

    get(row: number, col: number): T {
        return this.data[row][col];
    }

    set(row: number, col: number, value: T): void {
        this.data[row][col] = value;
    }

    flat(): T[] {
        return this.data.flat();
    }

    map<R>(
        callback: (item: T, row: number, col: number) => R
    ): R[] {
        return this.data.flatMap((row, rowIndex) =>
            row.map((item, colIndex) =>
                callback(item, rowIndex, colIndex)
            )
        );
    }
}