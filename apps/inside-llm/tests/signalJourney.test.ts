import {describe, expect, it} from "vitest";
import {tokenJourney, tokenRoute} from "../src/model/signalJourney";

describe("prompt journey", () => {
    it("visits attention and three feed-forward columns in each of nine blocks", () => {
        for (let token = 0; token < 5; token++) {
            const route = tokenRoute(token);
            expect(route).toHaveLength(38);
            for (let step = 1; step < route.length; step++) expect(route[step].x).toBeGreaterThan(route[step - 1].x);
        }
    });
    it("keeps all tokens at the input initially and delivers them before the answer", () => {
        for (let token = 0; token < 5; token++) {
            expect(tokenJourney(token, 0).progress).toBe(0);
            expect(tokenJourney(token, 49.6).progress).toBe(1);
            expect(tokenJourney(token, 49.6).position.x).toBe(970);
        }
    });
    it("reproduces an intermediate path and staggers prompt tokens", () => {
        expect(tokenJourney(0, 20)).toEqual(tokenJourney(0, 20));
        expect(tokenJourney(0, 20).progress).toBeGreaterThan(tokenJourney(4, 20).progress);
        expect(Object.values(tokenJourney(2, 30).position).every(Number.isFinite)).toBe(true);
    });
});
