import {vec, Vector} from "@/core/Vector";

export class Array2D<T> {
    private data: T[] = [];

    private constructor(
        public readonly width: number,
        public readonly height: number
    ) {}

    static createFill<T>(width: number, height: number, initValue: T) : Array2D<T>{
        const arr = new Array2D<T>(width, height)
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                arr.data.push(initValue)
            }
        }
        return arr
    }

    static create<T>(width: number, height: number, factory:(pos:Vector) => T) : Array2D<T>{
        const arr = new Array2D<T>(width, height)
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                arr.data.push( factory(vec(x, y)) )
            }
        }
        return arr
    }

    private getIndex(pos: Vector): number {
        return pos.y * this.width + pos.x;
    }

    get(pos:Vector): T {
        return this.data[this.getIndex(pos)];
    }

    set(pos:Vector, value: T): void {
        this.data[this.getIndex(pos)] = value;
    }

    forEachRow(y: number, func:(x:number, value:T) => void) {
        for (let x = 0; x < this.width; x++) {
            func(x, this.get(vec(x,y)))
        }
    }

    forEachColumn(x: number, func:(y:number, value:T) => void) {
        for (let y = 0; y < this.height; y++) {
            func(y, this.get(vec(x,y)))
        }
    }

    forEach(func: (pos:Vector, value:T) => void): Array2D<T>{
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const pos = vec(x, y)
                func(pos, this.get(pos))
            }
        }
        return this
    }

    map<R>(func: (pos: Vector, value:T) => R): R[] {
        const result: R[] = [];

        this.forEach((pos, value) => {
            result.push(func(pos, value));
        });

        return result;
    }

    isValid(pos: Vector): boolean {
        return (
            pos.x >= 0 &&
            pos.y >= 0 &&
            pos.x < this.width &&
            pos.y < this.height
        );
    }

}