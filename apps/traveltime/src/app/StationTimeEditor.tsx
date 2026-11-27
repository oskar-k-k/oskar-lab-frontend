"use client";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@oskar-lab/i18n/I18nProvider";
import type { components } from "@oskar-lab/api/backend";
import { timelinePoint } from "../model/timeline";
import { editStationTime } from "../model/edit-time";
import { TravelError } from "../services/client";
import type { Entry } from "./TravelWorkspace";
import styles from "./Travel.module.css";

/** Edits one station in a focus-trapped native dialog, preserving unsaved input on failure. */
export default function StationTimeEditor({ entry, point, disabled, onClose, onSave }: {
  entry: Entry;
  point: Entry["points"][number];
  disabled: boolean;
  onClose: () => void;
  onSave: (input: components["schemas"]["TravelSaveEntry"]) => Promise<void>;
}) {
  const { t } = useI18n();
  const dialog = useRef<HTMLDialogElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<"conflict" | "invalid" | "denied" | "error" | null>(null);
  const displayPoint = timelinePoint(point);
  const stay = point.role === "CHECK_IN" || point.role === "CHECK_OUT";
  useEffect(() => {
    const element = dialog.current;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    element?.showModal();
    return () => {
      element?.close();
      const focusTarget = trigger?.isConnected && !trigger.matches(":disabled") ? trigger : document.querySelector<HTMLButtonElement>("[data-travel-reload]");
      focusTarget?.focus({preventScroll: true});
    };
  }, []);
  return <dialog ref={dialog} className={styles.timeDialog} aria-labelledby="station-time-title"
    onCancel={event => { event.preventDefault(); if (!saving) onClose(); }}>
    <form onSubmit={event => {
      event.preventDefault();
      if (saving || disabled) return;
      const data = new FormData(event.currentTarget);
      setSaving(true); setError(null);
      void onSave(editStationTime(entry, point.role, String(data.get("date")), String(data.get("time") ?? ""), String(data.get("offset") ?? "")))
        .catch(reason => setError(reason instanceof TravelError ? reason.status === 409 ? "conflict" : reason.status === 400 ? "invalid" : reason.status === 403 ? "denied" : "error" : "error"))
        .finally(() => setSaving(false));
    }}>
      <h2 id="station-time-title">{t("travel.editDateTime")}</h2>
      <p>{point.placeName || entry.title} · {point.timeZone}</p>
      <fieldset disabled={saving || disabled}>
        <label>{t("travel.date")}<input autoFocus type="date" name="date" required defaultValue={point.date} /></label>
        <label>{t(stay ? point.role === "CHECK_IN" ? "travel.plannedArrival" : "travel.plannedDeparture" : "travel.time")}
          <input type="time" name="time" defaultValue={displayPoint.time?.slice(0,5) ?? ""} />
        </label>
        {stay && <small>{t("travel.plannedTimeHelp")}</small>}
        <details><summary>{t("travel.advancedTime")}</summary>
          <label>{t("travel.offset")}<input name="offset" pattern="Z|[+-][0-9]{2}:[0-9]{2}" /></label>
        </details>
      </fieldset>
      {error && <p role="alert">{t(`travel.${error}`)}</p>}
      <div className={styles.actions}>
        <button type="submit" className={styles.primary} disabled={saving || disabled}>{t(saving ? "travel.saving" : "travel.save")}</button>
        <button type="button" disabled={saving} onClick={onClose}>{t("travel.cancel")}</button>
      </div>
    </form>
  </dialog>;
}
