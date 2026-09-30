import {describe, expect, it, vi} from "vitest";
import {PlaybackClock} from "../src/model/playbackClock";

describe("frame clock", () => {
    it("delivers every frame independently of UI refresh", () => {
        const clock = new PlaybackClock();
        const listener = vi.fn(); clock.subscribe(listener);
        for (let frame = 0; frame < 60; frame++) clock.advance(1 / 60, false);
        expect(clock.time).toBeCloseTo(1);
        expect(listener).toHaveBeenCalledTimes(60);
    });
    it("seeks synchronously without duplicate renders and unsubscribes", () => {
        const clock = new PlaybackClock(); const listener = vi.fn();
        const remove = clock.subscribe(listener);
        clock.seek(18); clock.seek(18);
        expect(listener).toHaveBeenCalledTimes(1);
        remove(); clock.seek(29);
        expect(listener).toHaveBeenCalledTimes(1);
    });
    it("handles looping, end frames, and invalid input", () => {
        const clock = new PlaybackClock(); clock.seek(59.5); clock.advance(1, true);
        expect(clock.time).toBe(0.5);
        clock.seek(59.5); clock.advance(1, false); expect(clock.time).toBe(60);
        clock.seek(Number.NaN); expect(clock.time).toBe(0);
        clock.advance(Number.NaN, true); expect(clock.time).toBe(0);
    });
});
