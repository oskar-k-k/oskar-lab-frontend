"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PackingList } from "../model/packing";
import { travelRequest, TravelError } from "../services/client";

/** Loads one authorized trip; ambiguous writes require reloading before another save. */
export function usePackingList(tripId: string) {
  const [list, setList] = useState<PackingList | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [offline, setOffline] = useState(false);
  const [error, setError] = useState<"conflict" | "invalid" | "denied" | "error" | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [saved, setSaved] = useState(false);
  const active = useRef(true);
  const writing = useRef(false);
  const generation = useRef(0);
  const report = useCallback((reason: unknown) => {
    const status = reason instanceof TravelError ? reason.status : 503;
    setError(status === 409 ? "conflict" : status === 400 ? "invalid" : [401, 403, 404].includes(status) ? "denied" : "error");
    setBlocked(status !== 400);
    if ([401, 403, 404].includes(status)) setList(null);
  }, []);
  const reload = useCallback(async () => {
    if (writing.current) return;
    const request = ++generation.current;
    setLoading(true); setSaved(false);
    try {
      const value = await travelRequest<PackingList>(`/${tripId}/packing`);
      if (!active.current || request !== generation.current) return;
      setList(value); setError(null); setBlocked(false);
    } catch (reason) {
      if (active.current && request === generation.current) report(reason);
    } finally {
      if (active.current && request === generation.current) setLoading(false);
    }
  }, [tripId, report]);
  useEffect(() => {
    active.current = true;
    const start = window.setTimeout(() => { setOffline(!navigator.onLine); void reload(); }, 0);
    const update = () => setOffline(!navigator.onLine);
    window.addEventListener("online", update); window.addEventListener("offline", update);
    return () => {
      active.current = false; window.clearTimeout(start);
      window.removeEventListener("online", update); window.removeEventListener("offline", update);
    };
  }, [reload]);
  const save = async (value: PackingList): Promise<boolean> => {
    if (writing.current || loading || offline || blocked) return false;
    writing.current = true; setSaving(true); setSaved(false); setError(null);
    try {
      const result = await travelRequest<PackingList>(`/${tripId}/packing`, "PUT", value);
      if (!active.current) return false;
      setList(result); setSaved(true); return true;
    } catch (reason) {
      if (active.current) report(reason);
      return false;
    } finally {
      writing.current = false;
      if (active.current) setSaving(false);
    }
  };
  return { list, loading, saving, offline, error, blocked, saved, reload, save };
}
