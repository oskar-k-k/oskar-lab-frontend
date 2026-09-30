"use client";

import {useEffect, useRef, useState} from "react";
import {useI18n} from "@oskar-lab/i18n/I18nProvider";
import {renderFrame} from "../model/renderer";

/** Draws only when film time or canvas dimensions change; caps high-DPI rendering cost. */
export default function Scene({time}: Readonly<{time: number}>) {
    const canvas = useRef<HTMLCanvasElement>(null);
    const [failed, setFailed] = useState(false);
    const {t} = useI18n();
    useEffect(() => {
        const element = canvas.current;
        if (!element) return;
        const ctx = element.getContext("2d");
        if (!ctx) { queueMicrotask(() => setFailed(true)); return; }
        function draw() {
            if (!element || !ctx) return;
            const scale = Math.min(window.devicePixelRatio || 1, 2);
            const width = Math.round(element.clientWidth * scale);
            const height = Math.round(element.clientHeight * scale);
            if (element.width !== width || element.height !== height) { element.width = width; element.height = height; }
            renderFrame(ctx, width, height, time, {
                prompt: t("llm.dataPrompt"), tokens: t("llm.dataTokens").split("|"),
                candidates: t("llm.dataCandidates").split("|"),
                attention: t("llm.dataAttention"), feedForward: t("llm.dataFeedForward"),
                transformer: t("llm.dataTransformer"), embeddings: t("llm.dataEmbeddings"),
                nextToken: t("llm.dataNextToken"), example: t("llm.dataExample"), answer: t("llm.weatherAnswer"),
            });
        }
        draw();
        const observer = new ResizeObserver(draw); observer.observe(element);
        return () => observer.disconnect();
    }, [time, t]);
    return <><canvas ref={canvas} aria-label={t("llm.canvas")} role="img" />{failed && <p role="alert" className="canvasError">{t("llm.canvasError")}</p>}</>;
}
