"use client";
import {useEffect, useState} from "react";
import {availableWords, parseExtraWords, wordGroups} from "./words";
import WordImage from "./WordImage";
import GameBoard from "./GameBoard";

type Session = {code: string; token: string};
type Player = {id: string; name: string; submitted: boolean; answers: number[]};
type Room = {code: string; category: string; phase: string; round: number; total: number; word: string; words: string[]; rows: string[]; players: Player[]; you: string; host: string; ownChoice: number};
const base = process.env.NEXT_PUBLIC_APP_BASE_PATH ?? "";
const defaults = ["S · Absolut top", "A · Sehr gut", "B · Ganz okay", "C · Eher nicht", "D · Nein danke", "E · Schwach", "F · Niemals", "? · Unentschieden"];
const categories: Record<string, string> = {"": "Keine Kategorie · nur eigene Wörter", food: "Essen & Snacks", dates: "Date-Ideen", intimacy: "Sexstellungen"};
async function request<T>(path: string, session?: Session, data?: unknown): Promise<T> {
    const response = await fetch(`${base}/api/game/rooms${path}`, {method: data === undefined ? "GET" : "POST", headers: {"Content-Type": "application/json", ...(session ? {"X-Tierlist-Token": session.token} : {})}, body: data === undefined ? undefined : JSON.stringify(data), cache: "no-store"});
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || result.detail || "Das hat nicht geklappt. Bitte prüfe Lobby und Eingaben.");
    return result;
}
export default function Page() {
    const [session, setSession] = useState<Session | null>(null), [room, setRoom] = useState<Room | null>(null);
    const [name, setName] = useState(""), [code, setCode] = useState(""), [category, setCategory] = useState("food");
    const [rows, setRows] = useState(defaults.slice(0, 5));
    const [extraText, setExtraText] = useState(""), [rounds, setRounds] = useState(10);
    const [invitedCode, setInvitedCode] = useState(""), [initialized, setInitialized] = useState(false);
    const [showImages, setShowImages] = useState(false);
    const poolSize = availableWords(category, extraText);
    const extraWords = parseExtraWords(extraText);
    function updatePool(nextCategory: string, nextText: string) {
        setCategory(nextCategory); setExtraText(nextText);
        setRounds(current => Math.min(current, Math.max(1, Math.min(100, availableWords(nextCategory, nextText)))));
    }
    const [error, setError] = useState(""), [busy, setBusy] = useState(false), [copied, setCopied] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => {
            const invite = new URLSearchParams(location.search).get("lobby")?.replace(/\D/g, "").slice(0, 6) ?? "";
            setCode(invite); setInvitedCode(invite);
            try { const saved = JSON.parse(sessionStorage.getItem("tierlist-session") ?? "null"); if (saved?.code && saved?.token && (!invite || saved.code === invite)) setSession(saved); } catch { /* no saved guest session */ }
            setInitialized(true);
        }, 0);
        return () => clearTimeout(timer);
    }, []);
    useEffect(() => {
        if (!session) return;
        let cancelled = false; let timer: ReturnType<typeof setTimeout>;
        async function poll() {
            try { const next = await request<Room>(`/${session!.code}`, session!); if (!cancelled) {setRoom(next); setError("");} }
            catch (e) { if (!cancelled) setError(e instanceof Error ? e.message : "Verbindung unterbrochen."); }
            finally { if (!cancelled) timer = setTimeout(poll, 1500); }
        }
        void poll(); return () => {cancelled = true; clearTimeout(timer);};
    }, [session]);
    async function enter(join: boolean) {
        setBusy(true); setError("");
        try {
            const next = await request<Session>(join ? `/${code}/join` : "", undefined, join ? {name} : {name, category, rows, extraWords, rounds});
            sessionStorage.setItem("tierlist-session", JSON.stringify(next)); setSession(next);
        } catch (e) {setError(e instanceof Error ? e.message : "Lobby konnte nicht geöffnet werden.");}
        finally {setBusy(false);}
    }
    async function act(action: string, row?: number) {
        if (!session || !room) return; setBusy(true); setError("");
        try {await request(`/${session.code}/actions`, session, {action, row, round: room.round}); setRoom(await request<Room>(`/${session.code}`, session));}
        catch (e) {setError(e instanceof Error ? e.message : "Aktion fehlgeschlagen.");} finally {setBusy(false);}
    }
    function exit() {sessionStorage.removeItem("tierlist-session"); setSession(null); setRoom(null); setError("");}
    const host = room?.host === room?.you;
    const inviteMode = Boolean(invitedCode) && !session;
    return <main>
        <header><a className="brand" href={base || "/"}>T<span>≋</span>M <small>TIERLIST MATCHER</small></a><a href={process.env.NEXT_PUBLIC_PLATFORM_URL ?? "http://localhost:10030"}>Ein Projekt von Oskar Lab ↗</a></header>
        {initialized && !inviteMode && !session && <section className="intro"><div className="eyebrow">GLEICHER BEGRIFF. ANDERE MEINUNG.</div><h1>Tierlist <em>Matcher</em></h1></section>}
        {error && <div role="alert" className="error">{error}</div>}
        {!initialized ? <p>Wird geladen …</p> : inviteMode ? <section className="panel invite"><h2>Gib deinen Namen ein</h2><form onSubmit={e => {e.preventDefault(); void enter(true);}}><label>Dein Name<input maxLength={24} value={name} onChange={e => setName(e.target.value)} placeholder="Dein Name" autoComplete="nickname" /></label><button disabled={busy || !name.trim() || code.length !== 6} type="submit">Lobby beitreten</button></form></section> : !session ? <div className="setup">
            <section className="panel"><span className="step">01 / DEIN SPIEL</span><h2>Lobby erstellen</h2>
                <label>Dein Anzeigename<input maxLength={24} value={name} onChange={e => setName(e.target.value)} placeholder="Wie sollen wir dich nennen?" /></label>
                <label>Kategorie<select value={category} onChange={e => updatePool(e.target.value, extraText)}>{Object.entries(categories).map(([id, title]) => <option key={id} value={id}>{title}{id ? ` · ${wordGroups[id].length} Wörter` : ""}</option>)}</select></label>
                <label className="image-toggle"><input type="checkbox" checked={showImages} onChange={e => setShowImages(e.target.checked)}/>Bilder anzeigen</label>
                <label>Eigene Wörter<textarea rows={4} maxLength={12200} value={extraText} onChange={e => updatePool(category, e.target.value)} placeholder={"Ein Begriff pro Zeile\nZum Beispiel: Lasagne\nTacos"}/></label>
                <p className="privacy">{category ? "Deine Wörter werden mit der Kategorie gemischt." : "Es werden nur deine eigenen Wörter gespielt."} Doppelte Begriffe zählen einmal. {poolSize} Begriffe verfügbar.</p>
                <label>Wörter / Runden<input type="number" min={1} max={Math.max(1, Math.min(100, poolSize))} value={rounds} onChange={e => setRounds(Number(e.target.value))}/></label>
                <label>Zeilen: {rows.length}<input type="range" min={2} max={8} value={rows.length} onChange={e => setRows(Array.from({length: Number(e.target.value)}, (_, i) => rows[i] ?? defaults[i]))}/></label>
                <div className="row-editor">{rows.map((row, i) => <label key={i}><span className={`swatch color-${i}`}>{i + 1}</span><input aria-label={`Titel für Zeile ${i + 1}`} maxLength={32} value={row} onChange={e => setRows(rows.map((v, n) => n === i ? e.target.value : v))}/></label>)}</div>
                <button disabled={busy || !name.trim() || rows.some(r => !r.trim()) || rounds < 1 || rounds > Math.min(100, poolSize) || !Number.isInteger(rounds) || extraWords.length > 200 || extraWords.some(word => word.length > 60)} onClick={() => void enter(false)}>Lobby erstellen <span>↗</span></button>
                {extraWords.length > 200 || extraWords.some(word => word.length > 60) ? <p role="alert">Maximal 200 eigene Wörter mit jeweils höchstens 60 Zeichen.</p> : null}
            </section>
            <section className="panel join"><span className="step">02 / ZUSAMMEN SPIELEN</span><h2>Schon eingeladen?</h2><p>2–8 Spieler. Jede Person spielt auf dem eigenen Gerät. Teilt den Lobbycode oder den Einladungslink.</p>
                <label>Lobbycode<input className="code" inputMode="numeric" maxLength={6} value={code} placeholder="000000" onChange={e => setCode(e.target.value.replace(/\D/g, ""))}/></label>
                <button className="secondary" disabled={busy || !name.trim() || code.length !== 6} onClick={() => void enter(true)}>Lobby beitreten</button>
                <p className="privacy">Ohne Konto. Namen und Antworten bleiben nur temporär im Spielserver. Keine Speicherung im Profil. Eure Listen verschwinden nach einem Server-Neustart oder zwei Stunden ohne Aktivität.</p>
            </section>
        </div> : !room ? <section className="panel"><p>Lobby wird geladen …</p><button className="secondary" onClick={exit}>Zurück</button></section> : <>
            <section className="room-bar"><div><span className="step">LOBBY</span><strong>{room.code}</strong><span>{categories[room.category]}{room.category ? ` · ${wordGroups[room.category]?.length ?? 0} Wörter` : ""}</span></div><div><label className="image-toggle"><input type="checkbox" checked={showImages} onChange={e => setShowImages(e.target.checked)}/>Bilder</label><button className="secondary" onClick={async () => {try {const link = new URL(location.href); link.search = `?lobby=${room.code}`; await navigator.clipboard.writeText(link.toString()); setCopied(true); setTimeout(() => setCopied(false), 2000);} catch {setError(`Bitte teile den Lobbycode ${room.code}.`);}}}>{copied ? "Link kopiert ✓" : "Einladen"}</button></div></section>
            <section className="game-turn" aria-live="polite">
                <div className="current-word">{showImages && ["voting", "reveal"].includes(room.phase) && <WordImage word={room.word} className="current-word-image"/>}<div><span className="step">{room.phase === "lobby" ? `${room.players.length}/8 Spieler · ${room.total} Runden` : room.phase === "finished" ? "Fertig" : `Runde ${room.round + 1} / ${room.total}`}</span><h2>{room.phase === "lobby" ? "Alle da?" : room.phase === "finished" ? "Eure Tierliste" : room.word}</h2><p>{room.phase === "voting" ? room.ownChoice >= 0 ? "Abgegeben · warte auf die anderen" : "Wähle eine Zeile in deiner Spalte" : room.phase === "reveal" ? "Aufgedeckt" : ""}</p></div></div>
                {room.phase === "lobby" && (host ? <button disabled={busy || room.players.length < 2} onClick={() => void act("start")}>Spiel starten</button> : <span>Warte auf den Host</span>)}
                {room.phase === "reveal" && (host ? <button disabled={busy} onClick={() => void act("next")}>{room.round + 1 === room.total ? "Ergebnis ansehen" : "Nächste Runde →"}</button> : <span>Warte auf den Host</span>)}
            </section>
            <GameBoard rows={room.rows} words={room.words} players={room.players} you={room.you} phase={room.phase} round={room.round} word={room.word} ownChoice={room.ownChoice} busy={busy} showImages={showImages} onVote={row => void act("vote", row)}/>
            {room.words.length > 0 && <details className="score-explanation"><summary>Wie wird der Match-Wert berechnet?</summary><p>Gleiche Zeile: 100%. Gegenüberliegende Enden: 0%. Dazwischen zählt der Abstand. Der Wert mittelt alle aufgedeckten Runden und vergleicht jede Person mit dir.</p></details>}
            <button className="text-button" onClick={exit}>Zur Startseite</button>
        </>}
        <footer>SPIELEN. VERGLEICHEN. DISKUTIEREN.<span>Tierlist Matcher / Oskar Lab</span></footer>
    </main>;
}
