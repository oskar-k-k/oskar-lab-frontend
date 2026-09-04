import {isNumberObject} from "node:util/types";

export class Vector{
    x: number = 0
    y: number = 0

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }

    clone(): Vector{
        return new Vector(this.x, this.y)
    }

    set(x:number, y:number) : Vector{
        this.x = x
        this.y = y
        return this
    }

    setZero(): Vector{
        this.x = 0
        this.y = 0
        return this
    }


    add(vec2: Vector): Vector{
        this.x += vec2.x
        this.y += vec2.y
        return this
    }

    sub(vec2: Vector): Vector{
        this.x -= vec2.x
        this.y -= vec2.y
        return this
    }

    multiply(vec2: Vector): Vector{
        this.x *= vec2.x
        this.y *= vec2.y
        return this
    }

    divide(vec2: Vector): Vector{
        this.x /= vec2.x
        this.y /= vec2.y
        return this
    }

    addNum(scalar:number): Vector{
        this.x += scalar
        this.y += scalar
        return this
    }

    subNum(scalar:number): Vector{
        this.x -= scalar
        this.y -= scalar
        return this
    }

    multiplyNum(scalar:number): Vector{
        this.x *= scalar
        this.y *= scalar
        return this
    }

    divideNum(scalar:number): Vector{
        this.x /= scalar
        this.y /= scalar
        return this
    }

    equals(vec2: Vector): boolean{
        return this.x === vec2.x && this.y === vec2.y
    }

    isZero(): boolean{
        return this.x === 0 && this.y === 0
    }

    getSum(): number{
        return this.x + this.y
    }

    toString(): string{
        return this.x.toString() + "-" + this.y.toString()
    }
}

export function vec(x:number, y:number){
    return new Vector(x, y)
}