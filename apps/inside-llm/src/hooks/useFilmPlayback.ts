"use client";

import {useCallback, useEffect, useState} from "react";
import {clampTime, DURATION} from "../model/timeline";

/** Advances film time only during visible playback and holds the final frame. */
export function useFilmPlayback() {
    const [time, setTime] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [speed, setSpeed] = useState(1);
    const [loop, setLoop] = useState(true);
    const toggle = useCallback(() => {
        if (time >= DURATION) setTime(0);
        setPlaying(value => !value);
    }, [time]);

    useEffect(() => {
        if (!playing) return;
        let frame = 0;
        let previous: number | null = null;
        const tick = (now: number) => {
            if (previous !== null) {
                const delta = Math.min((now - previous) / 1000, 0.1) * speed;
                setTime(value => loop && value + delta >= DURATION ? (value + delta) % DURATION : clampTime(value + delta));
            }
            previous = now;
            frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        const visibility = () => { previous = null; if (document.hidden) setPlaying(false); };
        document.addEventListener("visibilitychange", visibility);
        return () => { cancelAnimationFrame(frame); document.removeEventListener("visibilitychange", visibility); };
    }, [playing, speed, loop]);

    useEffect(() => {
        if (time >= DURATION && playing) queueMicrotask(() => setPlaying(false));
    }, [time, playing]);

    return {time, setTime, playing, setPlaying, speed, setSpeed, loop, setLoop, toggle};
}
