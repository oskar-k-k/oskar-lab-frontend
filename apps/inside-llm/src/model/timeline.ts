export const DURATION = 90;
export const CHAPTER_STARTS = [0, 12, 26, 43, 60, 73] as const;

/** Clamps untrusted timeline values to the finite film interval. */
export function clampTime(value: number): number {
    return Number.isFinite(value) ? Math.max(0, Math.min(DURATION, value)) : 0;
}

/** Derives the chapter and local progress without depending on frame rate. */
export function filmState(value: number) {
    const time = clampTime(value);
    const chapter = CHAPTER_STARTS.findLastIndex(start => time >= start);
    const start = CHAPTER_STARTS[chapter];
    const end = CHAPTER_STARTS[chapter + 1] ?? DURATION;
    return {time, chapter, progress: (time - start) / (end - start)};
}

/** Produces stable pseudo-random values for replayable scene geometry. */
export function noise(index: number): number {
    const value = Math.sin(index * 127.1 + 311.7) * 43758.5453;
    return value - Math.floor(value);
}

/** Formats elapsed film time as minutes and seconds. */
export function timestamp(time: number): string {
    const seconds = Math.floor(clampTime(time));
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
