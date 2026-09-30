"use client";

import {memo, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import {useI18n} from "@oskar-lab/i18n/I18nProvider";
import {GpuLines} from "../model/gpuLines";
import {renderFrame} from "../model/renderer";
import type {PlaybackClock} from "../model/playbackClock";
import type {SceneLabels} from "../model/dataAnnotations";

/** Keeps one resize observer and submits at most one canvas frame per changed time or size. */
function Scene({clock}: Readonly<{clock: PlaybackClock}>) {
    const gpuCanvas = useRef<HTMLCanvasElement>(null);
    const gpu = useRef<GpuLines | undefined>(undefined);
    const canvas = useRef<HTMLCanvasElement>(null);
    const [failed, setFailed] = useState(false);
    const {t} = useI18n();
    const labels = useMemo<SceneLabels>(() => ({
                inputTokens: Number(t("llm.debugInputCount")), outputTokens: Number(t("llm.debugOutputCount")),
                debug: [t("llm.debugTitle"), t("llm.debugModel"), t("llm.debugTokens"), t("llm.debugOps"), t("llm.debugMemory"), t("llm.debugReference"), t("llm.debugEnergy"), t("llm.debugCarbon"), t("llm.debugCost"), t("llm.debugNote")],
                architecture: t("llm.architecture"), outputPipeline: t("llm.outputPipeline"), chat: t("llm.chatEntry"), enter: t("llm.enterHint"), tokenNote: t("llm.tokenNote"),
                causal: t("llm.causalNote"), shared: t("llm.sharedNote"), residual: t("llm.residualNote"),
                output: t("llm.output"), repeat: t("llm.repeatNote"), prompt: t("llm.dataPrompt"), tokens: t("llm.dataTokens").split("|"),
                candidates: t("llm.dataCandidates").split("|"),
                attention: t("llm.dataAttention"), feedForward: t("llm.dataFeedForward"),
                transformer: t("llm.dataTransformer"), embeddings: t("llm.dataEmbeddings"),
                nextToken: t("llm.dataNextToken"), example: t("llm.dataExample"), answer: t("llm.weatherAnswer"),
            }), [t]);
    const draw = useRef<() => void>(() => undefined);
    const size = useRef({width: 0, height: 0});
    const last = useRef({time: -1, width: -1, height: -1, labels: null as SceneLabels | null});
    const metrics = useRef({last: 0, total: 0, count: 0, render: 0});

    useLayoutEffect(() => {
        draw.current = () => {
            const time = clock.time;
            const element = canvas.current;
            if (!element || !size.current.width) return;
            const {width, height} = size.current;
            if (last.current.time === time && last.current.width === width && last.current.height === height && last.current.labels === labels) return;
            const ctx = element.getContext("2d");
            if (!ctx) { queueMicrotask(() => setFailed(true)); return; }
            if (element.width !== width || element.height !== height) { element.width = width; element.height = height; }
            const started = performance.now();
            renderFrame(ctx, width, height, time, labels, gpu.current);
            element.dataset.renderer = gpu.current ? "webgl" : "canvas2d";
            const elapsed = performance.now() - started;
            element.dataset.renderMs = elapsed.toFixed(2);
            const sample = metrics.current;
            const interval = started - sample.last;
            if (interval > 0 && interval < 250 && last.current.time !== time) {
                sample.total += interval; sample.render += elapsed; sample.count++;
                if (sample.count >= 60) {
                    element.dataset.frameFps = (sample.count * 1000 / sample.total).toFixed(1);
                    element.dataset.meanRenderMs = (sample.render / sample.count).toFixed(2);
                    sample.total = 0; sample.count = 0; sample.render = 0;
                }
            } else { sample.total = 0; sample.count = 0; sample.render = 0; }
            sample.last = started;
            last.current = {time, width, height, labels};
        };
        draw.current();
        return clock.subscribe(() => draw.current());
    }, [clock, labels]);

    useEffect(() => {
        const element = canvas.current;
        if (!element) return;
        const surface = gpuCanvas.current;
        const initializeGpu = () => {
            if (!surface) return;
            try { gpu.current = new GpuLines(surface); surface.style.display = "block"; }
            catch { gpu.current = undefined; surface.style.display = "none"; }
            last.current.time = -1; draw.current();
        };
        const loseGpu = (event: Event) => {
            event.preventDefault(); gpu.current = undefined;
            if (surface) surface.style.display = "none";
            last.current.time = -1; draw.current();
        };
        initializeGpu();
        surface?.addEventListener("webglcontextlost", loseGpu);
        surface?.addEventListener("webglcontextrestored", initializeGpu);
        const resize = () => {
            const ratio = Math.min(window.devicePixelRatio || 1, 2);
            const width = Math.round(element.clientWidth * ratio);
            const height = Math.round(element.clientHeight * ratio);
            if (size.current.width === width && size.current.height === height) return;
            size.current = {width, height};
            draw.current();
        };
        const observer = new ResizeObserver(resize);
        observer.observe(element); window.addEventListener("resize", resize); resize();
        return () => { observer.disconnect(); window.removeEventListener("resize", resize); surface?.removeEventListener("webglcontextlost", loseGpu); surface?.removeEventListener("webglcontextrestored", initializeGpu); gpu.current?.dispose(); gpu.current = undefined; };
    }, []);
    return <><canvas ref={gpuCanvas} aria-hidden="true" /><canvas ref={canvas} aria-label={t("llm.canvas")} role="img" />{failed && <p role="alert" className="canvasError">{t("llm.canvasError")}</p>}</>;
}

export default memo(Scene);
