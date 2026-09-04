import {describe, expect, it} from "vitest";
import {Array2D} from "@/core/Array2D";
import {vec} from "@/core/Vector";

describe("Array2D", () => {
    it("creates values using their positions", () => {
        const grid = Array2D.create(2, 2, position => position.toString());

        expect(grid.get(vec(1, 0))).toBe("1-0");
        expect([...grid.values()]).toEqual(["0-0", "1-0", "0-1", "1-1"]);
    });

    it("distinguishes safe and strict access", () => {
        const grid = Array2D.createFill(2, 2, 0);

        expect(grid.tryGet(vec(2, 0))).toBeUndefined();
        expect(() => grid.get(vec(2, 0))).toThrow(RangeError);
    });
});
