import {clampTime, DURATION} from "./timeline";

/** Shares the frame-accurate playhead without routing every animation frame through React. */
export class PlaybackClock {
    private value = 0;
    private readonly listeners = new Set<() => void>();

    /** Current film position in seconds. */
    get time(): number { return this.value; }

    /** Sets a finite position and notifies renderers only when it changes. */
    seek(value: number): void {
        const next = clampTime(value);
        if (next === this.value) return;
        this.value = next;
        this.listeners.forEach(listener => listener());
    }

    /** Advances the playhead, wrapping only when looping is enabled. */
    advance(delta: number, loop: boolean): void {
        const next = this.value + Math.max(0, Number.isFinite(delta) ? delta : 0);
        this.seek(loop ? next % DURATION : next);
    }

    /** Subscribes to exact playhead changes; the returned function removes the listener. */
    subscribe(listener: () => void): () => void {
        this.listeners.add(listener);
        return () => { this.listeners.delete(listener); };
    }
}
