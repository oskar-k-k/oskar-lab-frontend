import {describe, expect, it} from "vitest";
import {cameraAt, layerCenter, LAYER_COUNT, PARTICLE_COUNT, particlePosition} from "../src/model/choreography";

describe("continuous model choreography", () => {
    it("keeps particles finite throughout the complete camera journey", () => {
        for (const time of [0, 8, 18, 29, 40, 51, 59.9, 60]) {
            for (let index = 0; index < PARTICLE_COUNT; index++) {
                const point = particlePosition(index, time);
                expect(Object.values(point).every(Number.isFinite)).toBe(true);
            }
        }
    });
    it("preserves input-to-output layer order at every camera position", () => {
        for (let layer = 1; layer < LAYER_COUNT; layer++) {
            expect(layerCenter(layer)).toBeGreaterThan(layerCenter(layer - 1));
        }
        expect(particlePosition(2200, 10).x).toBeLessThan(layerCenter(0));
        expect(particlePosition(1900, 10).x).toBeGreaterThan(layerCenter(LAYER_COUNT - 1));
    });
    it("returns the camera to its starting pose and reproduces a sought frame", () => {
        expect(cameraAt(60)).toEqual(cameraAt(0));
        expect(particlePosition(999, 29.25)).toEqual(particlePosition(999, 29.25));
        expect(cameraAt(-10)).toEqual(cameraAt(0));
    });
});
