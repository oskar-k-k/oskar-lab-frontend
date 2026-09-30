"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useI18n } from "@oskar-lab/i18n/I18nProvider";
import {
  fitFurniture,
  parseRoom,
  starterRoom,
  type Furniture,
  type Room,
} from "../model/room";
import RoomInspector from "./RoomInspector";
import RoomLibrary from "./RoomLibrary";
import styles from "./RoomStudio.module.css";

const Canvas = dynamic(() => import("./RoomCanvas"), { ssr: false });
const storageKey = "oskar-lab.room-studio.v1";
type History = { past: Room[]; present: Room; future: Room[] };

/** Offers a bilingual, local-first planner with equivalent form controls for all 3D edits. */
export default function RoomStudio() {
  const { t, locale, setLocale } = useI18n();
  const [history, setHistory] = useState<History>({
    past: [],
    present: starterRoom(),
    future: [],
  });
  const [ready, setReady] = useState(false);
  const [saveAllowed, setSaveAllowed] = useState(true);
  const [status, setStatus] = useState<
    "saved" | "saving" | "storageError" | "invalid" | "imported"
  >("saving");
  const [selected, setSelected] = useState<string | null>(null);
  const [backup, setBackup] = useState<string | null>(null);
  const [grid, setGrid] = useState(true),
    [snap, setSnap] = useState(true),
    [walls, setWalls] = useState(true);
  const [top, setTop] = useState(false),
    [reset, setReset] = useState(0);
  const room = history.present;
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const saved = parseRoom(JSON.parse(raw));
          setHistory({ past: [], present: saved, future: [] });
        }
      } catch {
        setStatus("storageError");
        setSaveAllowed(false);
      }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!ready || !saveAllowed) return;
    function save() {
      try {
        localStorage.setItem(storageKey, JSON.stringify(room));
        setStatus("saved");
      } catch {
        setStatus("storageError");
      }
    }
    const timer = window.setTimeout(save, 400);
    window.addEventListener("pagehide", save);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pagehide", save);
    };
  }, [room, ready, saveAllowed]);
  function commit(next: Room) {
    if (JSON.stringify(next) === JSON.stringify(room)) return;
    setHistory((current) => ({
      past: [...current.past.slice(-49), current.present],
      present: next,
      future: [],
    }));
    if (saveAllowed) setStatus("saving");
  }
  function updateItem(patch: Partial<Furniture>, id = selected) {
    commit({
      ...room,
      items: room.items.map((item) =>
        item.id === id ? fitFurniture({ ...item, ...patch }, room) : item,
      ),
    });
  }
  function undo() {
    setHistory((current) =>
      current.past.length
        ? {
            past: current.past.slice(0, -1),
            present: current.past[current.past.length - 1],
            future: [current.present, ...current.future],
          }
        : current,
    );
  }
  function redo() {
    setHistory((current) =>
      current.future.length
        ? {
            past: [...current.past, current.present],
            present: current.future[0],
            future: current.future.slice(1),
          }
        : current,
    );
  }
  function exportRoom() {
    const json = JSON.stringify(room, null, 2);
    setBackup(json);
    const url = URL.createObjectURL(
      new Blob([json], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "room-studio.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function importRoom(file?: File) {
    if (!file) return;
    try {
      if (file.size > 200_000) throw new Error("Too large");
      const next = parseRoom(JSON.parse(await file.text()));
      commit(next);
      setSelected(null);
      setStatus("imported");
      setReset((value) => value + 1);
    } catch {
      setStatus("invalid");
    }
  }
  return (
    <main className={styles.studio}>
      <header className={styles.header}>
        <a
          className={styles.brand}
          href={
            process.env.NEXT_PUBLIC_PLATFORM_URL ||
            (process.env.NEXT_PUBLIC_PLATFORM_SHELL === "standalone"
              ? "#"
              : "/")
          }
        >
          <span className={styles.logo}>⌑</span>
          <span>
            Room Studio<small>{t("room.byline")}</small>
          </span>
        </a>
        <div className={styles.headerActions}>
          <span className={styles.local}>{t("room.local")}</span>
          <button
            onClick={() => setLocale(locale === "en" ? "de" : "en")}
            aria-label={t("room.language")}
          >
            {locale === "en" ? "DE" : "EN"}
          </button>
          <button disabled={!ready} onClick={exportRoom}>
            {t("room.export")} ↗
          </button>
        </div>
      </header>
      <section className={styles.intro}>
        <div>
          <p className={styles.eyebrow}>{t("room.kicker")}</p>
          <h1>{t("room.title")}</h1>
          <p>{t("room.subtitle")}</p>
        </div>
        <div className={styles.project}>
          <label>
            <span>{t("room.project")}</span>
            <input
              aria-label={t("room.project")}
              maxLength={80}
              value={room.name}
              placeholder={t("room.untitled")}
              disabled={!ready}
              onChange={(event) =>
                commit({ ...room, name: event.target.value })
              }
            />
          </label>
          <span className={styles.status} role="status">
            ● {t(`room.${status}`)}
          </span>
        </div>
      </section>
      {backup && <section className={styles.backup} aria-label={t('room.backup')}>
        <details><summary>{t('room.backup')}</summary><p>{t('room.backupHint')}</p>
          <textarea aria-label={t('room.backup')} readOnly value={backup} onFocus={event => event.currentTarget.select()} />
        </details>
        <button onClick={() => setBackup(null)}>{t('room.close')}</button>
      </section>}
      <div className={styles.workspace}>
        <RoomLibrary
          room={room}
          ready={ready}
          commit={commit}
          setSelected={setSelected}
          importRoom={importRoom}
        />
        <section className={styles.viewport} aria-label={t("room.viewport")}>
          <div className={styles.toolbar}>
            <div className={styles.viewButtons}>
              <button aria-pressed={!top} onClick={() => setTop(false)}>
                {t("room.view3d")}
              </button>
              <button aria-pressed={top} onClick={() => setTop(true)}>
                {t("room.top")}
              </button>
            </div>
            <div>
              <button
                aria-label={t("room.undo")}
                title={t("room.undo")}
                disabled={!history.past.length}
                onClick={undo}
              >
                ↶
              </button>
              <button
                aria-label={t("room.redo")}
                title={t("room.redo")}
                disabled={!history.future.length}
                onClick={redo}
              >
                ↷
              </button>
              <button
                aria-label={t("room.resetView")}
                title={t("room.resetView")}
                onClick={() => setReset((value) => value + 1)}
              >
                ⌖
              </button>
            </div>
          </div>
          {ready ? (
            <Canvas
              room={room}
              selected={selected}
              grid={grid}
              walls={walls && !top}
              snap={snap}
              top={top}
              reset={reset}
              onSelect={setSelected}
              onMove={(id, x, z) => updateItem({ x, z }, id)}
            />
          ) : (
            <p className={styles.loading}>{t("room.loading")}</p>
          )}
          <div className={styles.roomBadge}>
            <span>
              {room.width} × {room.depth} m
            </span>
            <strong>{Number((room.width * room.depth).toFixed(2))} m²</strong>
          </div>
          <div className={styles.viewportFooter}>
            <span>{t("room.controls")}</span>
            <div>
              {(["grid", "snap", "walls"] as const).map((key, index) => (
                <label key={key}>
                  <input
                    type="checkbox"
                    checked={[grid, snap, walls][index]}
                    onChange={(event) =>
                      [setGrid, setSnap, setWalls][index](event.target.checked)
                    }
                  />
                  {t(`room.${key}`)}
                </label>
              ))}
            </div>
          </div>
        </section>
        <RoomInspector
          room={room}
          selected={selected}
          setSelected={setSelected}
          commit={commit}
          updateItem={updateItem}
        />
      </div>
      {(!saveAllowed || status === "storageError" || status === "invalid") && (
        <div className={styles.error} role="alert">
          {t(`room.${status === "invalid" ? "invalid" : "storageError"}`)}{" "}
          {!saveAllowed && (
            <button
              onClick={() => {
                setSaveAllowed(true);
                setStatus("saving");
              }}
            >
              {t("room.enableSave")}
            </button>
          )}
        </div>
      )}
      <footer className={styles.bottom}>
        <span>{t("room.footer")}</span>
        <span>{t("room.privacy")}</span>
      </footer>
    </main>
  );
}
