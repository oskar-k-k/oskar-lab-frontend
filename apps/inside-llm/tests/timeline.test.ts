import {describe, expect, it} from "vitest";
import {CHAPTER_STARTS, clampTime, filmState, noise, timestamp} from "../src/model/timeline";

describe("deterministic film timeline", () => {
    it("seeks to every chapter without relying on previous playback", () => {
        CHAPTER_STARTS.forEach((start, chapter) => {
            expect(filmState(start)).toEqual({time:start, chapter, progress:0});
            if (chapter > 0) expect(filmState(start - 0.01).chapter).toBe(chapter - 1);
        });
    });
    it("holds the completed final scene and rejects invalid positions", () => {
        expect(filmState(1000)).toEqual({time:90, chapter:5, progress:1});
        expect(clampTime(-1)).toBe(0);
        expect(clampTime(NaN)).toBe(0);
        expect(clampTime(Infinity)).toBe(0);
    });
    it("replays the same geometry and formats the full duration", () => {
        expect(Array.from({length:100}, (_, i) => noise(i))).toEqual(Array.from({length:100}, (_, i) => noise(i)));
        expect(timestamp(90)).toBe("1:30");
        expect(timestamp(9.8)).toBe("0:09");
    });
});
