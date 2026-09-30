import {describe, expect, it} from "vitest";
import {activationValue, formatActivation, OUTPUT_PROBABILITIES} from "../src/model/data";

describe("illustrative model data", () => {
    it("shows a complete, ordered candidate distribution", () => {
        expect(OUTPUT_PROBABILITIES.reduce((sum, value) => sum + value, 0)).toBe(100);
        expect([...OUTPUT_PROBABILITIES].sort((a, b) => b - a)).toEqual([...OUTPUT_PROBABILITIES]);
    });
    it("holds values long enough to read and reproduces them after seeking", () => {
        expect(activationValue(3, 2, 12.01)).toBe(activationValue(3, 2, 12.49));
        expect(activationValue(3, 2, 60)).toBe(activationValue(3, 2, 0));
        for (let row = 0; row < 20; row++) expect(Math.abs(activationValue(4, row, 22))).toBeLessThanOrEqual(9.99);
    });
    it("formats positive and negative values as aligned signed decimals", () => {
        expect(formatActivation(1.2)).toBe("+1.20");
        expect(formatActivation(-4.7)).toBe("-4.70");
    });
});
