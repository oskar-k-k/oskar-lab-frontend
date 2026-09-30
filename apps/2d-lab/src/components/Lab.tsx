"use client";

import { useEffect, useRef, useState } from "react";
import SceneEditor from "@oskar-lab/2d-lab/SceneEditor";
import MeasurementSettings from "@oskar-lab/2d-lab/MeasurementSettings";
import { exportSceneSvg } from "@oskar-lab/2d-lab/scene";
import { useI18n } from "@oskar-lab/i18n/I18nProvider";
import {
  initialDocument,
  maximumDocumentBytes,
  parseDocument,
  type LabDocument,
} from "../model/document";
import styles from "./Lab.module.css";

const storageKey = "oskar-lab.2d-lab.v1";
type History = {
  past: LabDocument[];
  present: LabDocument;
  future: LabDocument[];
};

function download(contents: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Application shell owns durable documents, import/export and undo history; the engine stays controlled. */
export default function Lab() {
  const { t, locale, setLocale } = useI18n();
  const [history, setHistory] = useState<History>(() => ({
    past: [],
    present: initialDocument({
      rectangle: t("scene2d.rectangle"),
      triangle: t("scene2d.triangle"),
    }),
    future: [],
  }));
  const [ready, setReady] = useState(false);
  const [saveEnabled, setSaveEnabled] = useState(false);
  const [status, setStatus] = useState<
    "ready" | "saved" | "storageError" | "importError" | "imported" | "exported"
  >("ready");
  const [revision, setRevision] = useState(0);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [exported, setExported] = useState<{
    text: string;
    name: string;
  } | null>(null);
  const upload = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved)
          setHistory({ past: [], present: parseDocument(saved), future: [] });
        setSaveEnabled(true);
      } catch {
        setStatus("storageError");
      }
      setReady(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!ready || !saveEnabled) return;
    const save = () => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(history.present));
        setStatus("saved");
      } catch {
        setStatus("storageError");
      }
    };
    const timer = setTimeout(save, 200);
    window.addEventListener("pagehide", save);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("pagehide", save);
    };
  }, [history.present, ready, saveEnabled]);
  function update(present: LabDocument) {
    setHistory((current) => ({
      past: [...current.past.slice(-49), current.present],
      present,
      future: [],
    }));
  }
  function undo() {
    setHistory((h) =>
      h.past.length
        ? {
            past: h.past.slice(0, -1),
            present: h.past[h.past.length - 1],
            future: [h.present, ...h.future],
          }
        : h,
    );
  }
  function redo() {
    setHistory((h) =>
      h.future.length
        ? {
            past: [...h.past, h.present],
            present: h.future[0],
            future: h.future.slice(1),
          }
        : h,
    );
  }
  async function importFile(file: File | undefined) {
    if (!file) return;
    try {
      if (file.size > maximumDocumentBytes)
        throw new Error("Document too large");
      const document = parseDocument(await file.text());
      update(document);
      setRevision((r) => r + 1);
      setStatus("imported");
      setImportOpen(false);
    } catch {
      setStatus("importError");
    }
  }
  return (
    <main className={styles.app}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <a
            href={
              process.env.NEXT_PUBLIC_PLATFORM_URL ||
              (process.env.NEXT_PUBLIC_PLATFORM_SHELL === "standalone"
                ? "http://localhost:10030"
                : "/")
            }
            aria-label={t("scene2d.back")}
          >
            ←
          </a>
          <div>
            <h1>
              2D Lab<span> / {t("scene2d.workspace")}</span>
            </h1>
            <p>{t("scene2d.subtitle")}</p>
          </div>
        </div>
        <div className={styles.actions}>
          <button
            disabled={!ready}
            onClick={() => {
              if (window.confirm(t("scene2d.newConfirm"))) {
                update({
                  ...history.present,
                  scene: { version: 1, objects: [] },
                });
                setRevision((r) => r + 1);
              }
            }}
          >
            {t("scene2d.new")}
          </button>
          <button
            disabled={!ready}
            onClick={() => setImportOpen((open) => !open)}
          >
            {t("scene2d.open")}
          </button>
          <button
            disabled={!ready}
            onClick={() => {
              download(
                JSON.stringify(history.present, null, 2),
                "2d-lab.json",
                "application/json",
              );
              setExported({
                text: JSON.stringify(history.present, null, 2),
                name: "2d-lab.json",
              });
              setStatus("exported");
            }}
          >
            {t("scene2d.save")}
          </button>
          <button
            disabled={!ready}
            className={styles.primary}
            onClick={() => {
              download(
                exportSceneSvg(history.present.scene),
                "2d-lab.svg",
                "image/svg+xml",
              );
              setExported({
                text: exportSceneSvg(history.present.scene),
                name: "2d-lab.svg",
              });
              setStatus("exported");
            }}
          >
            {t("scene2d.exportSvg")}
          </button>
          <button onClick={() => setLocale(locale === "de" ? "en" : "de")}>
            {locale === "de" ? "EN" : "DE"}
          </button>
          <input
            ref={upload}
            type="file"
            accept=".json,application/json"
            hidden
            onChange={(event) => {
              void importFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </div>
      </header>
      {importOpen && (
        <section className={styles.exportPanel} aria-label={t("scene2d.open")}>
          <div>
            <button onClick={() => upload.current?.click()}>
              {t("scene2d.chooseFile")}
            </button>
            <button onClick={() => setImportOpen(false)}>
              {t("scene2d.close")}
            </button>
          </div>
          <p>{t("scene2d.importHint")}</p>
          <textarea
            aria-label={t("scene2d.projectJson")}
            value={importText}
            maxLength={maximumDocumentBytes}
            onChange={(event) => setImportText(event.target.value)}
          />
          <button
            disabled={!importText.trim()}
            onClick={() => {
              try {
                update(parseDocument(importText));
                setRevision((r) => r + 1);
                setImportOpen(false);
                setImportText("");
                setStatus("imported");
              } catch {
                setStatus("importError");
              }
            }}
          >
            {t("scene2d.importJson")}
          </button>
        </section>
      )}
      {exported && (
        <section
          className={styles.exportPanel}
          aria-label={t("scene2d.exportBackup")}
        >
          <div>
            <strong>{exported.name}</strong>
            <button onClick={() => setExported(null)}>
              {t("scene2d.close")}
            </button>
          </div>
          <p>{t("scene2d.exportHint")}</p>
          <textarea
            aria-label={t("scene2d.exportBackup")}
            readOnly
            value={exported.text}
            onFocus={(event) => event.target.select()}
          />
        </section>
      )}
      <div className={styles.settings}>
        <MeasurementSettings
          value={history.present.measurements}
          onChange={(measurements) =>
            update({ ...history.present, measurements })
          }
        />
        <p role="status">{t(`scene2d.${status}`)}</p>
      </div>
      {ready ? (
        <SceneEditor
          key={revision}
          value={history.present.scene}
          onChange={(scene) => update({ ...history.present, scene })}
          measurements={history.present.measurements}
          undo={undo}
          redo={redo}
          canUndo={history.past.length > 0}
          canRedo={history.future.length > 0}
        />
      ) : (
        <p role="status">{t("scene2d.loading")}</p>
      )}
      <footer className={styles.footer}>{t("scene2d.footer")}</footer>
    </main>
  );
}
