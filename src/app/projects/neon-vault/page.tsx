"use client";

import {useMemo, useRef, useState} from "react";
import type {CSSProperties} from "react";
import {useI18n} from "@/lib/i18n/I18nProvider";
import styles from "./NeonVaultPage.module.css";

type GameId = "blackjack" | "roulette" | "slots";
type Card = {rank: string; suit: string; value: number};
type BlackjackPhase = "betting" | "playing" | "round-over";
type RouletteBet = "red" | "black" | "even" | "odd" | "zero";
type SlotSymbol = {icon: string; label: string; payout: number};

const initialBalance = 1000;
const blackjackBet = 50;
const rouletteBetAmount = 40;
const slotsBet = 25;
const rouletteSpinDuration = 1200;
const suits = ["♠", "♥", "♦", "♣"];
const ranks: Card[] = [
    {rank: "A", suit: "", value: 11},
    {rank: "2", suit: "", value: 2},
    {rank: "3", suit: "", value: 3},
    {rank: "4", suit: "", value: 4},
    {rank: "5", suit: "", value: 5},
    {rank: "6", suit: "", value: 6},
    {rank: "7", suit: "", value: 7},
    {rank: "8", suit: "", value: 8},
    {rank: "9", suit: "", value: 9},
    {rank: "10", suit: "", value: 10},
    {rank: "J", suit: "", value: 10},
    {rank: "Q", suit: "", value: 10},
    {rank: "K", suit: "", value: 10},
];
const redNumbers = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
const slotSymbols: SlotSymbol[] = [
    {icon: "◆", label: "Diamond", payout: 8},
    {icon: "7", label: "Seven", payout: 6},
    {icon: "$", label: "Credit", payout: 4},
    {icon: "★", label: "Star", payout: 3},
    {icon: "BAR", label: "Bar", payout: 2},
    {icon: "●", label: "Chip", payout: 0},
];

function drawCard(): Card {
    const rank = ranks[Math.floor(Math.random() * ranks.length)];
    const suit = suits[Math.floor(Math.random() * suits.length)];
    return {...rank, suit};
}

function scoreHand(hand: Card[]): number {
    let score = hand.reduce((total, card) => total + card.value, 0);
    let aces = hand.filter(card => card.rank === "A").length;

    while (score > 21 && aces > 0) {
        score -= 10;
        aces -= 1;
    }

    return score;
}

function getRouletteColor(number: number): "red" | "black" | "green" {
    if (number === 0) return "green";
    return redNumbers.has(number) ? "red" : "black";
}

function getRouletteWin(number: number, bet: RouletteBet): number {
    if (bet === "zero") return number === 0 ? rouletteBetAmount * 35 : 0;
    if (number === 0) return 0;
    if (bet === "red" || bet === "black") return getRouletteColor(number) === bet ? rouletteBetAmount * 2 : 0;
    if (bet === "even") return number % 2 === 0 ? rouletteBetAmount * 2 : 0;
    return number % 2 === 1 ? rouletteBetAmount * 2 : 0;
}

function spinSlots(): SlotSymbol[] {
    return Array.from({length: 3}, () => slotSymbols[Math.floor(Math.random() * slotSymbols.length)]);
}

/** Runs a local play-money casino with blackjack, roulette, and slots. */
export default function NeonVaultPage() {
    const {t} = useI18n();
    const [balance, setBalance] = useState(initialBalance);
    const [activeGame, setActiveGame] = useState<GameId>("blackjack");
    const [playerHand, setPlayerHand] = useState<Card[]>([]);
    const [dealerHand, setDealerHand] = useState<Card[]>([]);
    const [blackjackPhase, setBlackjackPhase] = useState<BlackjackPhase>("betting");
    const [blackjackMessage, setBlackjackMessage] = useState(() => t("casino.blackjackStart"));
    const [rouletteBet, setRouletteBet] = useState<RouletteBet>("red");
    const [rouletteNumber, setRouletteNumber] = useState<number | null>(null);
    const [rouletteBallAngle, setRouletteBallAngle] = useState(28);
    const [rouletteSpinId, setRouletteSpinId] = useState(0);
    const [rouletteSpinning, setRouletteSpinning] = useState(false);
    const [rouletteMessage, setRouletteMessage] = useState(() => t("casino.rouletteStart"));
    const [reels, setReels] = useState<SlotSymbol[]>(slotSymbols.slice(0, 3));
    const [slotsMessage, setSlotsMessage] = useState(() => t("casino.slotsStart"));
    const rouletteTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const playerScore = useMemo(() => scoreHand(playerHand), [playerHand]);
    const dealerScore = useMemo(() => scoreHand(dealerHand), [dealerHand]);
    const canAffordBlackjack = balance >= blackjackBet;
    const canAffordRoulette = balance >= rouletteBetAmount;
    const canAffordSlots = balance >= slotsBet;

    function resetBank() {
        setBalance(initialBalance);
        setBlackjackPhase("betting");
        setPlayerHand([]);
        setDealerHand([]);
        setBlackjackMessage(t("casino.blackjackRefilled"));
        setRouletteMessage(t("casino.rouletteRefilled"));
        setRouletteNumber(null);
        setRouletteBallAngle(28);
        setRouletteSpinning(false);
        if (rouletteTimeout.current !== null) clearTimeout(rouletteTimeout.current);
        setSlotsMessage(t("casino.slotsRefilled"));
    }

    function startBlackjack() {
        if (!canAffordBlackjack) return;
        const nextPlayerHand = [drawCard(), drawCard()];
        const nextDealerHand = [drawCard(), drawCard()];
        const nextScore = scoreHand(nextPlayerHand);

        setBalance(current => current - blackjackBet);
        setPlayerHand(nextPlayerHand);
        setDealerHand(nextDealerHand);
        setBlackjackPhase(nextScore === 21 ? "round-over" : "playing");
        if (nextScore === 21) {
            setBalance(current => current + blackjackBet * 3);
            setBlackjackMessage(t("casino.blackjackNatural"));
        } else {
            setBlackjackMessage(t("casino.blackjackPlay"));
        }
    }

    function hitBlackjack() {
        if (blackjackPhase !== "playing") return;
        const nextHand = [...playerHand, drawCard()];
        const nextScore = scoreHand(nextHand);
        setPlayerHand(nextHand);

        if (nextScore > 21) {
            setBlackjackPhase("round-over");
            setBlackjackMessage(t("casino.blackjackBust"));
        }
    }

    function standBlackjack() {
        if (blackjackPhase !== "playing") return;
        let nextDealerHand = [...dealerHand];

        while (scoreHand(nextDealerHand) < 17) {
            nextDealerHand = [...nextDealerHand, drawCard()];
        }

        const nextDealerScore = scoreHand(nextDealerHand);
        setDealerHand(nextDealerHand);
        setBlackjackPhase("round-over");

        if (nextDealerScore > 21 || playerScore > nextDealerScore) {
            setBalance(current => current + blackjackBet * 2);
            setBlackjackMessage(t("casino.blackjackWin"));
        } else if (playerScore === nextDealerScore) {
            setBalance(current => current + blackjackBet);
            setBlackjackMessage(t("casino.blackjackPush"));
        } else {
            setBlackjackMessage(t("casino.blackjackLose"));
        }
    }

    function spinRoulette() {
        if (!canAffordRoulette || rouletteSpinning) return;
        const number = Math.floor(Math.random() * 37);
        const payout = getRouletteWin(number, rouletteBet);
        const color = getRouletteColor(number);
        const landingAngle = 360 - (number / 37) * 360;

        if (rouletteTimeout.current !== null) clearTimeout(rouletteTimeout.current);
        setBalance(current => current - rouletteBetAmount);
        setRouletteSpinning(true);
        setRouletteNumber(null);
        setRouletteSpinId(current => current + 1);
        setRouletteMessage(t("casino.rouletteSpinning"));
        setRouletteBallAngle(landingAngle);
        rouletteTimeout.current = setTimeout(() => {
            setBalance(current => current + payout);
            setRouletteNumber(number);
            setRouletteSpinning(false);
            setRouletteMessage(payout > 0 ? t("casino.rouletteWin", {number, color, payout}) : t("casino.rouletteLose", {number, color}));
        }, rouletteSpinDuration);
    }

    function playSlots() {
        if (!canAffordSlots) return;
        const nextReels = spinSlots();
        const [first, second, third] = nextReels;
        const payout = first.label === second.label && second.label === third.label ? slotsBet * first.payout : 0;

        setReels(nextReels);
        setBalance(current => current - slotsBet + payout);
        setSlotsMessage(payout > 0 ? t("casino.slotsWin", {symbol: first.label, payout}) : t("casino.slotsLose"));
    }

    return (
        <main className={styles.page}>
            <section className={styles.hero} aria-labelledby="casino-title">
                <div>
                    <p className={styles.kicker}>{t("casino.kicker")}</p>
                    <h1 id="casino-title">{t("casino.title")}</h1>
                    <p>{t("casino.subtitle")}</p>
                </div>
                <aside className={styles.wallet} aria-label={t("casino.wallet")}>
                    <span>{t("casino.wallet")}</span>
                    <strong>{balance}</strong>
                    <button type="button" onClick={resetBank}>{t("casino.refill")}</button>
                </aside>
            </section>

            <nav className={styles.gameTabs} aria-label={t("casino.games")}>
                {[
                    ["blackjack", t("casino.blackjack")],
                    ["roulette", t("casino.roulette")],
                    ["slots", t("casino.slots")],
                ].map(([id, label]) => (
                    <button
                        key={id}
                        type="button"
                        className={activeGame === id ? styles.activeTab : undefined}
                        aria-pressed={activeGame === id}
                        onClick={() => setActiveGame(id as GameId)}
                    >
                        {label}
                    </button>
                ))}
            </nav>

            {activeGame === "blackjack" && (
                <section className={styles.table} aria-labelledby="blackjack-title">
                    <div className={styles.tableHeader}>
                        <div>
                            <p className={styles.kicker}>{t("casino.tableBet", {amount: blackjackBet})}</p>
                            <h2 id="blackjack-title">{t("casino.blackjack")}</h2>
                        </div>
                        <p className={styles.status} role="status" aria-live="polite">{blackjackMessage}</p>
                    </div>
                    <div className={styles.blackjackGrid}>
                        <Hand title={t("casino.dealer")} hand={dealerHand} score={dealerHand.length > 0 ? dealerScore : null} />
                        <Hand title={t("casino.player")} hand={playerHand} score={playerHand.length > 0 ? playerScore : null} />
                    </div>
                    <div className={styles.actions}>
                        <button type="button" onClick={startBlackjack} disabled={blackjackPhase === "playing" || !canAffordBlackjack}>{t("casino.deal")}</button>
                        <button type="button" onClick={hitBlackjack} disabled={blackjackPhase !== "playing"}>{t("casino.hit")}</button>
                        <button type="button" onClick={standBlackjack} disabled={blackjackPhase !== "playing"}>{t("casino.stand")}</button>
                    </div>
                </section>
            )}

            {activeGame === "roulette" && (
                <section className={styles.table} aria-labelledby="roulette-title">
                    <div className={styles.tableHeader}>
                        <div>
                            <p className={styles.kicker}>{t("casino.spinBet", {amount: rouletteBetAmount})}</p>
                            <h2 id="roulette-title">{t("casino.roulette")}</h2>
                        </div>
                        <p className={styles.status} role="status" aria-live="polite">{rouletteMessage}</p>
                    </div>
                    <div className={styles.rouletteLayout}>
                        <div
                            key={rouletteSpinId}
                            className={`${styles.wheel} ${rouletteSpinning ? styles.spinningWheel : ""}`}
                            data-color={rouletteNumber === null ? "idle" : getRouletteColor(rouletteNumber)}
                            style={{"--ball-angle": `${rouletteBallAngle}deg`} as CSSProperties}
                        >
                            <div className={styles.wheelRotor} aria-hidden="true" />
                            <div className={styles.ballTrack} aria-hidden="true">
                                <span className={styles.ball} />
                            </div>
                            <span className={styles.resultPocket}>{rouletteNumber ?? "?"}</span>
                        </div>
                        <fieldset className={styles.betBoard}>
                            <legend>{t("casino.betField")}</legend>
                            {[
                                ["red", t("casino.red")],
                                ["black", t("casino.black")],
                                ["even", t("casino.even")],
                                ["odd", t("casino.odd")],
                                ["zero", t("casino.zero")],
                            ].map(([value, label]) => (
                                <label key={value} className={styles.betOption}>
                                    <input
                                        type="radio"
                                        name="roulette-bet"
                                        value={value}
                                        checked={rouletteBet === value}
                                        onChange={() => setRouletteBet(value as RouletteBet)}
                                        disabled={rouletteSpinning}
                                    />
                                    <span>{label}</span>
                                </label>
                            ))}
                        </fieldset>
                    </div>
                    <div className={styles.actions}>
                        <button type="button" onClick={spinRoulette} disabled={!canAffordRoulette || rouletteSpinning}>{t("casino.spinWheel")}</button>
                    </div>
                </section>
            )}

            {activeGame === "slots" && (
                <section className={styles.table} aria-labelledby="slots-title">
                    <div className={styles.tableHeader}>
                        <div>
                            <p className={styles.kicker}>{t("casino.spinBet", {amount: slotsBet})}</p>
                            <h2 id="slots-title">{t("casino.slots")}</h2>
                        </div>
                        <p className={styles.status} role="status" aria-live="polite">{slotsMessage}</p>
                    </div>
                    <div className={styles.reels} aria-label={t("casino.reels")}>
                        {reels.map((symbol, index) => (
                            <div key={`${symbol.label}-${index}`} className={styles.reel}>
                                <span>{symbol.icon}</span>
                                <small>{symbol.label}</small>
                            </div>
                        ))}
                    </div>
                    <div className={styles.actions}>
                        <button type="button" onClick={playSlots} disabled={!canAffordSlots}>{t("casino.spinSlots")}</button>
                    </div>
                </section>
            )}
        </main>
    );
}

function Hand({title, hand, score}: Readonly<{title: string; hand: Card[]; score: number | null}>) {
    const {t} = useI18n();

    return (
        <article className={styles.hand}>
            <header>
                <h3>{title}</h3>
                <span>{score === null ? t("casino.noCards") : t("casino.points", {score})}</span>
            </header>
            <div className={styles.cards}>
                {hand.length > 0 ? hand.map((card, index) => (
                    <div key={`${card.rank}-${card.suit}-${index}`} className={styles.card} data-red={card.suit === "♥" || card.suit === "♦"}>
                        <span>{card.rank}</span>
                        <strong>{card.suit}</strong>
                    </div>
                )) : <p>{t("casino.cardsPlaceholder")}</p>}
            </div>
        </article>
    );
}
