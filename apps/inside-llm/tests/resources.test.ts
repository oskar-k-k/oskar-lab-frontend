import {describe, expect, it} from "vitest";
import {resourceEstimate} from "../src/model/resources";

describe("cinematic resource counters", () => {
    it("starts only after submission", () => {
        const start = resourceEstimate(3.4, 5, 6);
        expect(start.gigaFlops).toBe(0);
        expect(start.energyWh).toBe(0);
        expect(start.generated).toBe(0);
    });
    it("reaches reference totals before the film ends", () => {
        const end = resourceEstimate(59, 5, 6);
        expect(end.inputProcessed).toBe(5);
        expect(end.generated).toBe(6);
        expect(end.gigaFlops).toBeCloseTo(164);
        expect(end.energyWh).toBe(0.24);
        expect(end.waterMl).toBe(0.26);
        expect(end.electricityEuro).toBeCloseTo(0.000072, 8);
        expect(resourceEstimate(60, 7, 7).generated).toBe(7);
    });
    it("is monotonic, seekable and independent of frame history", () => {
        let previous = 0;
        for (let time = 0; time <= 60; time += 0.25) {
            const value = resourceEstimate(time, 5, 6);
            expect(value.energyWh).toBeGreaterThanOrEqual(previous);
            previous = value.energyWh;
        }
        expect(resourceEstimate(18, 5, 6)).toEqual(resourceEstimate(18, 5, 6));
        expect(resourceEstimate(Number.NaN, 5, 6).energyWh).toBe(0);
    });
});
