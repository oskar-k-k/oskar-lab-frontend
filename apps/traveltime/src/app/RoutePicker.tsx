"use client";
import { useState } from "react";
import { useI18n } from "@oskar-lab/i18n/I18nProvider";
import type { components } from "@oskar-lab/api/backend";
import { googleMapsRoute, type RouteOrigin } from "../model/routes";
import styles from "./Travel.module.css";

/** Keeps route selection local and leaves location permissions and navigation to Google Maps. */
export default function RoutePicker({ destination, origins }: {
  destination: components["schemas"]["TravelPoint"];
  origins: readonly RouteOrigin[];
}) {
  const { t } = useI18n();
  const [selected, setSelected] = useState(origins[0]?.id ?? "current");
  const origin = origins.find(value => value.id === selected);
  return <div className={styles.routePicker}>
    <label>{t("travel.routeFrom")}
      <select value={origin?.id ?? "current"} onChange={event => setSelected(event.target.value)}>
        {origins.map(value => <option key={value.id} value={value.id}>{value.name}</option>)}
        <option value="current">{t("travel.currentLocation")}</option>
      </select>
    </label>
    <a className={styles.routeOpen} href={googleMapsRoute(destination, origin?.point)} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">
      <svg viewBox="0 0 20 20" width="17" height="17" aria-hidden="true"><circle cx="5" cy="5" r="2"/><circle cx="15" cy="15" r="2"/><path d="M5 7v6a3 3 0 0 0 3 3h2m5-3V7a3 3 0 0 0-3-3h-2"/></svg>
      {t("travel.openRoute")} ↗
    </a>
  </div>;
}
