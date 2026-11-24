import {matchPercent} from "./match";
import type {CSSProperties} from "react";
import WordImage from "./WordImage";
type Player = {id: string; name: string; submitted: boolean; answers: number[]};
type Props = {rows: string[]; words: string[]; players: Player[]; you: string; phase: string; round: number; word: string; ownChoice: number; busy: boolean; showImages: boolean; onVote: (row: number) => void};
export default function GameBoard({rows, words, players, you, phase, round, word, ownChoice, busy, showImages, onVote}: Props) {
    const me = players.find(player => player.id === you);
    const ordered = me ? [me, ...players.filter(player => player.id !== you)] : players;
    const choosing = phase === "voting";
    const revealed = phase === "reveal";
    return <div className="board-scroll" tabIndex={0} aria-label="Spielbrett, horizontal scrollbar">
        <table className="game-board" style={{"--players": ordered.length} as CSSProperties}>
            <caption className="sr-only">Gemeinsame Tierliste. Wähle eine Zeile in deiner Spalte. Match-Prozente vergleichen aufgedeckte Runden mit deiner Einordnung.</caption>
            <thead><tr><th scope="col" className="tier-heading">Tier</th>{ordered.map(player => {
                const score = me ? matchPercent(me.answers, player.answers, rows.length) : null;
                return <th scope="col" key={player.id} className={player.id === you ? "mine-heading" : ""}><strong>{player.name}</strong><span>{player.id === you ? "Du" : score === null ? "Noch kein Match-Wert" : `${score}% Match mit dir`}</span><small>{choosing ? player.submitted ? "✓ Abgegeben" : "Überlegt …" : phase === "lobby" ? "Bereit" : ""}</small></th>;
            })}</tr></thead>
            <tbody>{rows.map((row, tier) => {
                const matches = revealed ? ordered.filter(player => player.answers[round] === tier) : [];
                const connected = matches.length >= 2;
                return <tr key={tier}><th scope="row" className={`tier-label color-${tier}`}>{row}</th>{ordered.map((player, column) => {
                    const mine = player.id === you;
                    const matched = connected && player.answers[round] === tier;
                    const pending = mine && choosing && ownChoice === tier;
                    const content = <>{words.map((item, index) => (phase === "finished" || index === round) && player.answers[index] === tier ? <span key={index} className={`word-chip ${revealed && index === round ? "just-revealed" : ""} ${matched && index === round ? "matched-chip" : ""}`}>{showImages && <WordImage word={item}/>}<span>{item}</span>{matched && index === round ? <span aria-label="Gleiche Einordnung" className="match-symbol"> ⛓</span> : null}</span> : null)}{pending && <span className="word-chip pending-chip">{showImages && <WordImage word={word}/>}<span>{word} ✓</span></span>}{mine && choosing && ownChoice < 0 && <span className="place-hint">Hier einordnen <span>＋</span></span>}</>;
                    return <td key={player.id} className={`${mine ? "my-cell" : ""} ${matched ? "linked-cell" : ""}`} style={{"--link-delay": `${column * 80}ms`} as CSSProperties}>
                        {matched && <span key={`${round}-${tier}`} className="match-wire" aria-hidden="true"/>}
                        {mine && choosing ? <button className="cell-choice" disabled={busy || ownChoice >= 0} aria-label={`${word} in ${row} einordnen`} aria-pressed={pending} onClick={() => onVote(tier)}>{content}</button> : <div className="cell-contents">{content}</div>}
                    </td>;
                })}</tr>;
            })}</tbody>
        </table>
    </div>;
}
