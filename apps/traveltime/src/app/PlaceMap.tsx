"use client";
import { useState } from "react";
import { useI18n } from "@oskar-lab/i18n/I18nProvider";
import { appPath } from "@oskar-lab/config/paths";
import { googleMapsEmbed, googleMapsLink, mapQuery } from "../model/maps";
import styles from "./Travel.module.css";

/** Loads an external Google map only after per-station consent; private notes and dates never leave the app. */
export default function PlaceMap({ placeName, address }: {
  placeName: string;
  address: string;
}) {
  const { t, locale } = useI18n();
  const query = mapQuery(placeName, address);
  const [publicKey, setPublicKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  if (!query) return null;
  const href = googleMapsLink(query);
  async function loadMap() {
    setLoading(true);
    setFailed(false);
    try {
      const response = await fetch(appPath("/api/maps"), {
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });
      const data: unknown = await response.json();
      if (
        !response.ok || !data || typeof data !== "object" ||
        !("publicKey" in data) || typeof data.publicKey !== "string" || !data.publicKey
      ) throw new Error("Map unavailable");
      setPublicKey(data.publicKey);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }
  return <section className={styles.placeMap} aria-label={`${t("travel.map")} · ${placeName || address}`}>
    {publicKey ? <>
      <div className={styles.mapFrame}>
        <iframe title={`${t("travel.map")} · ${placeName || address}`} src={googleMapsEmbed(query, publicKey, locale)} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" />
        <a className={styles.mapOverlay} aria-hidden="true" tabIndex={-1} href={href} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" aria-label={t("travel.openMaps")} />
      </div>
      <button type="button" className={styles.mapHide} onClick={() => setPublicKey("")}>{t("travel.hideMap")}</button>
    </> : <div className={styles.mapConsent}>
      <svg viewBox="0 0 64 52" width="64" height="52" aria-hidden="true"><path d="m3 16 18-7 21 8 19-7v33l-19 7-21-8-18 7Z" /><path d="M21 10v32m21-24v31" /><path d="M32 3a8 8 0 0 0-8 8c0 6 8 13 8 13s8-7 8-13a8 8 0 0 0-8-8Z" /><circle cx="32" cy="11" r="2" /></svg>
      <p>{t("travel.mapConsent")}</p>
      <button type="button" disabled={loading} onClick={() => void loadMap()}>{t(loading ? "travel.loadingMap" : "travel.loadMap")}</button>
      {failed && <p role="status">{t("travel.mapUnavailable")}</p>}
    </div>}
    <a className={styles.mapLink} href={href} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">{t("travel.openMaps")} ↗</a>
  </section>;
}
