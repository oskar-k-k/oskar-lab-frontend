import {expect, it} from "vitest";
import {matchPercent} from "../src/app/match";
it("scores revealed tier distances, including multiple rounds and different row counts", () => {
    expect(matchPercent([], [], 5)).toBeNull();
    expect(matchPercent([0], [0], 5)).toBe(100);
    expect(matchPercent([0], [4], 5)).toBe(0);
    expect(matchPercent([0], [1], 5)).toBe(75);
    expect(matchPercent([0, 4], [0, 0], 5)).toBe(50);
    expect(matchPercent([0, 3], [1], 3)).toBe(50);
});
