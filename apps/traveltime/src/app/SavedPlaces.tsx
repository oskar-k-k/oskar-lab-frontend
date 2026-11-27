"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@oskar-lab/i18n/I18nProvider";
import type { TranslationKey } from "@oskar-lab/i18n/messages";
import { travelRequest, TravelError } from "../services/client";
import { safeSavedUrl, type SavedPlace, type SavedPlacePage } from "../model/saved-places";
import styles from "./SavedPlaces.module.css";

/** Trip-scoped inspiration library; external services are contacted only when a user opens a saved link. */
export default function SavedPlaces({ tripId, canEdit, onDirtyChange, onBusyChange }: {
  tripId: string; canEdit: boolean; onDirtyChange: (dirty: boolean) => void; onBusyChange: (busy: boolean) => void;
}) {
  const { t } = useI18n();
  const label = (key: string) => t(("travel." + key) as TranslationKey);
  const [places, setPlaces] = useState<SavedPlace[]>([]);
  const [editing, setEditing] = useState<SavedPlace | null | undefined>(undefined);
  const [loading, setLoading] = useState(true), [busy, setBusy] = useState(false), [offline, setOffline] = useState(false);
  const [error, setError] = useState<"savedConflict" | "savedInvalid" | "savedLimit" | "denied" | "error" | null>(null);
  const [blocked, setBlocked] = useState(false), [saved, setSaved] = useState(false);
  const [page, setPage] = useState(0), [more, setMore] = useState(false);
  const active = useRef(true), pending = useRef(false);
  const report = useCallback((reason: unknown) => {
    const status = reason instanceof TravelError ? reason.status : 503;
    const limit = reason instanceof TravelError && reason.code === "savedPlaceLimit";
    setError(limit ? "savedLimit" : status === 409 ? "savedConflict" : status === 400 ? "savedInvalid" : [401, 403, 404].includes(status) ? "denied" : "error");
    setBlocked(!limit && status !== 400);
    if ([401, 403, 404].includes(status)) setPlaces([]);
  }, []);
  const load = useCallback(async (next = 0) => {
    setLoading(true);
    try {
      const result = await travelRequest<SavedPlacePage>(`/${tripId}/saved?page=${next}`);
      if (!active.current) return;
      setPlaces(previous => next ? Array.from(new Map([...previous, ...result.places].map(place => [place.id, place])).values()) : result.places);
      setPage(next); setMore(result.hasMore); setError(null); setBlocked(false);
    } catch (reason) { if (active.current) report(reason); }
    finally { if (active.current) setLoading(false); }
  }, [tripId, report]);
  useEffect(() => {
    active.current = true;
    const start = window.setTimeout(() => { setOffline(!navigator.onLine); void load(); }, 0);
    const update = () => setOffline(!navigator.onLine);
    window.addEventListener("online", update); window.addEventListener("offline", update);
    return () => { active.current = false; window.clearTimeout(start); window.removeEventListener("online", update); window.removeEventListener("offline", update); };
  }, [load]);
  const disabled = busy || loading || offline || blocked;
  const write = async (action: () => Promise<void>) => {
    if (pending.current || disabled || !canEdit) return;
    pending.current = true; setBusy(true); onBusyChange(true); setError(null); setSaved(false);
    try { await action(); if (active.current) setSaved(true); }
    catch (reason) { if (active.current) report(reason); }
    finally { pending.current = false; if (active.current) { setBusy(false); onBusyChange(false); } }
  };
  return <section className={styles.library} aria-labelledby="saved-places-title">
    <header className={styles.heading}><div><p>{label("savedEyebrow")}</p><h1 id="saved-places-title">{label("navSaved")}</h1></div>
      {canEdit && editing === undefined && <button disabled={disabled} onClick={() => setEditing(null)}>＋ {label("savedAdd")}</button>}
    </header>
    <p className={styles.intro}>{label("savedIntro")}</p>
    <div role="status">{busy ? label("saving") : loading ? label("loading") : saved ? label("saved") : ""}</div>
    {offline && <p role="status">{label("offline")}</p>}
    {error && <div role="alert" className={styles.notice}><p>{label(error)}</p>
      {blocked && <p>{label("savedReloadHelp")}</p>}
      <button disabled={busy || offline || loading} onClick={() => {
        if (editing !== undefined && !window.confirm(label("discardChanges"))) return;
        setEditing(undefined); onDirtyChange(false); void load();
      }}>{label("reload")}</button>
    </div>}
    {editing !== undefined && error !== "denied" && <form key={editing?.id ?? "new"} className={styles.form} onChange={() => onDirtyChange(true)} onSubmit={event => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const input = { title: String(data.get("title") ?? "").trim(), url: String(data.get("url") ?? "").trim(), notes: String(data.get("notes") ?? "").trim(), version: editing?.version ?? 0 };
      if (!input.title || !safeSavedUrl(input.url)) { setError("savedInvalid"); return; }
      void write(async () => {
        await travelRequest<SavedPlace>(`/${tripId}/saved${editing ? "/" + editing.id : ""}`, editing ? "PUT" : "POST", input);
        if (!active.current) return;
        setEditing(undefined); onDirtyChange(false); await load();
      });
    }}>
      <label>{label("savedTitle")}<input name="title" maxLength={160} required defaultValue={editing?.title ?? ""} disabled={disabled}/></label>
      <label>{label("savedUrl")}<input name="url" type="url" maxLength={2048} placeholder="https://" defaultValue={editing?.url ?? ""} disabled={disabled}/></label>
      <label>{label("notes")}<textarea name="notes" maxLength={1000} rows={3} defaultValue={editing?.notes ?? ""} disabled={disabled}/></label>
      <div className={styles.actions}><button type="submit" disabled={disabled}>{label("save")}</button><button type="button" disabled={busy} onClick={() => { setEditing(undefined); onDirtyChange(false); }}>{label("cancel")}</button></div>
    </form>}
    {!loading && !places.length && !error && editing === undefined && <div className={styles.empty}><svg viewBox="0 0 24 24" width="38" height="38" aria-hidden="true"><path d="M6 4h12v17l-6-4-6 4Z"/></svg><h2>{label("savedEmpty")}</h2><p>{label("savedEmptyText")}</p></div>}
    <div className={styles.grid}>{places.map(place => <article key={place.id} className={styles.card}>
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M6 4h12v17l-6-4-6 4Z"/></svg>
      <h2>{place.title}</h2>{place.notes && <p>{place.notes}</p>}
      {place.url && <a href={place.url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">{new URL(place.url).hostname} ↗<span className={styles.srOnly}> · {label("savedOpen")}</span></a>}
      {canEdit && <div className={styles.actions}><button disabled={disabled || editing !== undefined} onClick={() => setEditing(place)}>{label("edit")}</button>
        <button disabled={disabled || editing !== undefined} onClick={() => { if (window.confirm(label("savedDelete"))) void write(async () => {
          await travelRequest(`/${tripId}/saved/${place.id}?version=${place.version}`, "DELETE"); await load();
        }); }}>{label("delete")}</button></div>}
    </article>)}</div>
    {more && <button disabled={loading || busy || offline || editing !== undefined} onClick={() => void load(page + 1)}>{label("more")}</button>}
  </section>;
}
