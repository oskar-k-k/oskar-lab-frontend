"use client";

import {useEffect, useRef, useState} from "react";
import {useI18n} from "@oskar-lab/i18n/I18nProvider";
import type {TranslationKey} from "@oskar-lab/i18n/messages";
import {CHAPTER_STARTS, clampTime, DURATION, filmState, timestamp} from "../model/timeline";
import Scene from "./Scene";
import {useFilmPlayback} from "../hooks/useFilmPlayback";

const chapterKeys: TranslationKey[] = ["llm.chapter1", "llm.chapter2", "llm.chapter3", "llm.chapter4", "llm.chapter5", "llm.chapter6"];

/** Coordinates film playback, chapter navigation and a clean recording surface. */
export default function Film({platformUrl}: Readonly<{platformUrl: string}>) {
    const {t, locale, setLocale} = useI18n();
    const {time, setTime, playing, setPlaying, speed, setSpeed, loop, setLoop, toggle} = useFilmPlayback();
    const [cinema, setCinema] = useState(false);
    const [controlsVisible, setControlsVisible] = useState(true);
    const [error, setError] = useState("");
    const container = useRef<HTMLDivElement>(null);
    const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const {chapter, progress} = filmState(time);
    useEffect(() => {
        function keyboard(event: KeyboardEvent) {
            if (event.key === "Escape") setCinema(false);
            const target = event.target as HTMLElement;
            if (target.closest("button, input, select, a, textarea")) return;
            if (event.code === "Space") {event.preventDefault(); toggle();}
        }
        window.addEventListener("keydown", keyboard);
        return () => window.removeEventListener("keydown", keyboard);
    }, [toggle]);

    useEffect(() => () => {if (hideTimer.current) clearTimeout(hideTimer.current);}, []);

    function revealControls() {
        setControlsVisible(true);
        if (hideTimer.current) clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => setControlsVisible(false), 2400);
    }

    async function fullscreen() {
        try {
            if (document.fullscreenElement) await document.exitFullscreen();
            else await container.current?.requestFullscreen();
            setError("");
        } catch {setError(t("llm.fullscreenError"));}
    }

    return <div className={`filmApp ${cinema ? "cinema" : ""}`} ref={container} onPointerMove={revealControls}>
        <header className="topbar">
            <a href={platformUrl} className="brand" aria-label={t("llm.back")}>
                <span className="brandMark">◈</span> OSKAR LAB <span className="brandDivider">/</span> <span className="brandSection">{t("llm.eyebrow")}</span>
            </a>
            <div className="topActions">
                <span className="localBadge">
                    <i /> {t("llm.eyebrow")}</span>
                <label className="language">
                    <span className="srOnly">{t("llm.language")}</span>
                    <select value={locale} onChange={event => setLocale(event.target.value === "de" ? "de" : "en")}>
                        <option value="en">EN</option>
                        <option value="de">DE</option>
                    </select>
                </label>
            </div>
        </header>
        <main>
            <section className="intro">
                <div>
                    <p className="overline">{t("llm.eyebrow")}</p>
                    <h1>{t("llm.title")}</h1>
                    <p className="subtitle">{t("llm.subtitle")}</p>
                </div>
                <div className="filmMeta">
                    <span className="metaLine" />{t("llm.duration")}</div>
            </section>
            <section className="player" aria-label={t("llm.title")}>
                <div className="stage">
                    <Scene time={time} />

                </div>
                <div className={`transport ${cinema && !controlsVisible ? "controlsHidden" : ""}`} onFocusCapture={event => {if (event.target.matches(":focus-visible")) {setControlsVisible(true); if (hideTimer.current) clearTimeout(hideTimer.current);} else revealControls();}}>
                    <div className="scrubber">
                        <input aria-label={t("llm.timeline")} type="range" min="0" max={DURATION} step="0.01" value={time} onChange={event => setTime(clampTime(Number(event.target.value)))} style={{"--progress": `${time / DURATION * 100}%`} as React.CSSProperties} />
                    </div>
                    <div className="transportRow">
                        <div className="playback">
                            <button className="playButton" onClick={toggle}>
                                <span aria-hidden="true">{playing ? "Ⅱ" : "▶"}</span>{t(playing ? "llm.pause" : time >= DURATION ? "llm.replay" : "llm.play")}</button>
                            <button className="iconButton" onClick={() => {setTime(0); setPlaying(false);}} aria-label={t("llm.restart")}>↺</button>
                            <span className="timecode">{timestamp(time)} <b>/ {timestamp(DURATION)}</b>
                            </span>
                        </div>
                        <div className="viewControls">
                            <button className="loopButton" aria-label={t("llm.loop")} aria-pressed={loop} onClick={() => setLoop(value => !value)}>∞</button>
                            <label>
                                <span className="srOnly">{t("llm.speed")}</span>
                                <select value={speed} onChange={event => setSpeed(Number(event.target.value))}>{[0.5, 1, 1.5, 2].map(value => <option key={value} value={value}>{value}×</option>)}</select>
                            </label>
                            <button onClick={() => {setCinema(value => !value); revealControls();}} aria-pressed={cinema}>{t(cinema ? "llm.exit" : "llm.cinema")}</button>
                            <button className="iconButton" onClick={fullscreen} aria-label={t("llm.fullscreen")}>⛶</button>
                        </div>
                    </div>
                </div>
            </section>
            {error && <p role="alert" className="error">{error}</p>}
            <section className="chapterSection">
                <div className="sectionHeading">
                    <h2>{t("llm.chapters")}</h2>
                    <span>{t("llm.hint")}</span>
                </div>
                <nav className="chapterGrid" aria-label={t("llm.chapters")}>{CHAPTER_STARTS.map((start, index) => <button key={start} className={chapter === index ? "active" : ""} aria-current={chapter === index ? "step" : undefined} onClick={() => setTime(start)}>
                    <span className="chapterNumber">{String(index + 1).padStart(2, "0")}<span>{timestamp(start)}</span>
                    </span>
                    <strong>{t(chapterKeys[index])}</strong>
                    <span className="chapterTrack">
                        <i style={{width: chapter > index ? "100%" : chapter === index ? `${progress * 100}%` : "0%"}} />
                    </span>
                </button>)}</nav>

            </section>
            <footer>
                <span>{t("llm.note")}</span>
                <span>OSKAR LAB © {new Date().getFullYear()}</span>
            </footer>
        </main>
    </div>;
}
