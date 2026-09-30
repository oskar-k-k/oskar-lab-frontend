"use client";

import {useCallback, useEffect, useState} from "react";
import {DURATION} from "../model/timeline";
import {PlaybackClock} from "../model/playbackClock";

/** Renders on the browser clock while updating transport controls at ten hertz. */
export function useFilmPlayback() {
    const [clock] = useState(() => new PlaybackClock());
    const [time, updateTime] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [speed, setSpeed] = useState(1);
    const [loop, setLoop] = useState(true);
    const setTime = useCallback((value: number) => { clock.seek(value); updateTime(clock.time); }, [clock]);
    const toggle = useCallback(() => {
        if (clock.time >= DURATION) { clock.seek(0); updateTime(0); }
        updateTime(clock.time);
        setPlaying(value => !value);
    }, [clock]);

    useEffect(() => {
        if (!playing) return;
        let frame = 0;
        let previous: number | null = null;
        let lastUi = 0;
        const tick = (now: number) => {
            if (previous !== null) clock.advance((now - previous) / 1000 * speed, loop);
            previous = now;
            if (now - lastUi >= 100 || clock.time >= DURATION) { updateTime(clock.time); lastUi = now; }
            if (!loop && clock.time >= DURATION) { setPlaying(false); return; }
            frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        const visibility = () => { previous = null; if (document.hidden) { updateTime(clock.time); setPlaying(false); } };
        document.addEventListener("visibilitychange", visibility);
        return () => { cancelAnimationFrame(frame); document.removeEventListener("visibilitychange", visibility); };
    }, [clock, playing, speed, loop]);

    return {clock, time, setTime, playing, setPlaying, speed, setSpeed, loop, setLoop, toggle};
}
