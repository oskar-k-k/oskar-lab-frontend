"use client";
import { useState } from "react";
import { useI18n } from "@oskar-lab/i18n/I18nProvider";
import { parseMapEmbedUrl, googleMapsLink, mapQuery } from "../model/maps";
import styles from "./Travel.module.css";

/** Loads a saved Google map after per-station consent, without sending booking notes or dates. */
export default function PlaceMap({ placeName, address, mapEmbedUrl }: {
  placeName: string;
  address: string;
  mapEmbedUrl?: string | null;
}) {
  const { t } = useI18n();
  const query = mapQuery(placeName, address);
  const embed = parseMapEmbedUrl(mapEmbedUrl ?? "");
  const [loaded, setLoaded] = useState(false);
  if (!query && !embed) return null;
  const href = embed ?? googleMapsLink(query);
  const mapTitle = `${t("travel.map")} · ${placeName || address}`;
  return (
    <section className={styles.placeMap} aria-label={mapTitle}>
      {loaded && embed ? (
        <>
          <div className={styles.mapFrame}>
            <iframe title={mapTitle} src={embed} loading="lazy" referrerPolicy="no-referrer" />
            <a
              className={styles.mapOverlay}
              aria-hidden="true"
              tabIndex={-1}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              referrerPolicy="no-referrer"
            />
          </div>
          <button type="button" className={styles.mapHide} onClick={() => setLoaded(false)}>
            {t("travel.hideMap")}
          </button>
        </>
      ) : (
        <div className={styles.mapConsent}>
          <svg viewBox="0 0 64 52" width="64" height="52" aria-hidden="true">
            <path d="m3 16 18-7 21 8 19-7v33l-19 7-21-8-18 7Z" />
            <path d="M21 10v32m21-24v31" />
            <path d="M32 3a8 8 0 0 0-8 8c0 6 8 13 8 13s8-7 8-13a8 8 0 0 0-8-8Z" />
            <circle cx="32" cy="11" r="2" />
          </svg>
          <p>{t("travel.mapConsent")}</p>
          {embed ? (
            <button type="button" onClick={() => setLoaded(true)}>{t("travel.loadMap")}</button>
          ) : <p>{t("travel.mapMissing")}</p>}
        </div>
      )}
      <a className={styles.mapLink} href={href} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">
        {t("travel.openMaps")} ↗
      </a>
    </section>
  );
}
