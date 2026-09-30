"use client";

import {useI18n} from "@oskar-lab/i18n/I18nProvider";
import type {TranslationKey} from "@oskar-lab/i18n/messages";

/** Presents scripted tokenization, sampling and answer overlays for the current chapter. */
export default function SceneOverlay({chapter, progress}: Readonly<{chapter: number; progress: number}>) {
    const {t} = useI18n();
    const words = t("llm.answer").split(" ");
    const answer = words.slice(0, Math.min(words.length, Math.floor(progress * (words.length + 2)))).join(" ");
    const tokens = t("llm.tokens").split("|");
    return (
        <div className="sceneContent" >
            {chapter === 0 && <div className={`promptScene ${progress > 0.45 ? "tokenized" : ""}`}>
                <p className="sceneLabel">{t("llm.input")}</p>{progress <= 0.45 ? <h2>{t("llm.prompt")}</h2> : <div className="tokens">{tokens.map((token, index) => <span key={index} style={{"--token": index} as React.CSSProperties}>{token}<small>{String(1024 + index * 371)}</small>
                </span>)}</div>}<div className="promptRule" />
            </div>}
            {chapter === 4 && <div className="candidates">
                <p className="sceneLabel">{t("llm.candidate")}</p>{(["llm.tokenA", "llm.tokenB", "llm.tokenC", "llm.tokenD"] as TranslationKey[]).map((key, index) => <div key={key} className={`candidate ${index === 0 && progress > 0.65 ? "chosen" : ""}`}>
                    <span>{t(key)}</span>
                    <div>
                        <i style={{width: `${[62, 21, 11, 6][index]}%`}} />
                    </div>
                    <b>{[62, 21, 11, 6][index]}%</b>
                </div>)}{progress > 0.65 && <span className="selected">{t("llm.selected")} → {t("llm.tokenA")}</span>}</div>}
            {chapter === 5 && <div className="answerScene">
                <p className="sceneLabel">{t("llm.output")}</p>
                <h2>{answer}<span className="cursor" />
                </h2>{progress > 0.88 && <p className="endLine">{t("llm.end")}</p>}</div>}
        </div>
    );
}
