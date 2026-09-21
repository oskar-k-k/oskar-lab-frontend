import {describe, expect, it} from "vitest";
import {Vector, vec} from "@oskar-lab/core/Vector";

describe("Vector", () => {
    it("returns new vectors without changing the source", () => {
        const source = vec(2, 3);
        const result = source.add(vec(4, -1));

        expect(result).toEqual(new Vector(6, 2));
        expect(result).not.toBe(source);
        expect(source).toEqual(new Vector(2, 3));
    });

    it("supports scalar calculations", () => {
        expect(vec(4, 6).divide(2)).toEqual(vec(2, 3));
        expect(vec(4, 6).multiply(2)).toEqual(vec(8, 12));
    });
});
