"use client";

import {useEffect, useRef, useState} from "react";
import {renderSoundtrack} from "../services/soundtrack";

/** Plays the local score in sync with seeking, speed changes, pause and camera loops. */
export function useSoundtrack(time: number, playing: boolean, speed: number) {
    const [enabled, setEnabled] = useState(true);
    const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
    const [volume, setVolume] = useState(0.45);
    const context = useRef<AudioContext | null>(null);
    const buffer = useRef<AudioBuffer | null>(null);
    const output = useRef<GainNode | null>(null);
    const source = useRef<AudioBufferSourceNode | null>(null);
    const pending = useRef<Promise<void> | null>(null);
    const mounted = useRef(true);
    const anchor = useRef({time: 0, offset: 0, rate: 1});

    async function prepare() {
        if (!enabled) return;
        try {
            context.current ??= new AudioContext();
            await context.current.resume();
            if (buffer.current || pending.current) return;
            setStatus("loading");
            pending.current = renderSoundtrack().then(result => {
                if (!mounted.current) return;
                buffer.current = result;
                setStatus("ready");
            }).catch(() => { if (mounted.current) setStatus("error"); }).finally(() => { pending.current = null; });
            await pending.current;
        } catch { if (mounted.current) setStatus("error"); }
    }

    useEffect(() => {
        const audio = context.current;
        if (!audio || !buffer.current || status !== "ready") return;
        if (!output.current) {
            output.current = audio.createGain();
            output.current.connect(audio.destination);
        }
        output.current.gain.setTargetAtTime(volume, audio.currentTime, 0.04);
        function stop() {
            if (!source.current) return;
            source.current.stop(); source.current.disconnect(); source.current = null;
        }
        if (!enabled || !playing || time >= 60) { stop(); return; }
        const expected = anchor.current.offset + (audio.currentTime - anchor.current.time) * anchor.current.rate;
        if (source.current && (Math.abs(expected - time) > 0.22 || anchor.current.rate !== speed)) stop();
        if (!source.current) {
            const next = audio.createBufferSource();
            next.buffer = buffer.current;
            next.playbackRate.value = speed;
            next.connect(output.current);
            next.start(0, Math.min(time, 59.999));
            source.current = next;
            anchor.current = {time: audio.currentTime, offset: time, rate: speed};
        }
    }, [time, playing, speed, enabled, status, volume]);

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
            source.current?.stop(); source.current = null;
            void context.current?.close(); context.current = null;
        };
    }, []);

    async function toggleMusic() {
        if (!enabled) {
            setEnabled(true);
            try {
                context.current ??= new AudioContext();
                await context.current.resume();
                if (!buffer.current) {
                    setStatus("loading");
                    buffer.current = await renderSoundtrack();
                    if (mounted.current) setStatus("ready");
                }
            } catch { if (mounted.current) setStatus("error"); }
        } else setEnabled(false);
    }

    return {enabled, status, volume, setVolume, prepare, toggleMusic};
}
