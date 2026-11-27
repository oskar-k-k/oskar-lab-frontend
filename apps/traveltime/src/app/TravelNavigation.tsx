"use client";
import { useI18n } from "@oskar-lab/i18n/I18nProvider";
import styles from "./TravelNavigation.module.css";

export type TravelSection = "packing" | "timeline" | "add" | "saved" | "trips";
const sections: readonly TravelSection[] = ["packing", "timeline", "add", "saved", "trips"];
const paths: Record<TravelSection, React.ReactNode> = {
  packing: <><rect x="5" y="7" width="14" height="14" rx="3"/><path d="M9 7V4h6v3M5 12h14M10 11v3h4v-3"/></>,
  timeline: <><path d="M7 3v18M7 6h10M7 12h7M7 18h10"/><circle cx="7" cy="6" r="2"/><circle cx="7" cy="18" r="2"/></>,
  add: <path d="M12 5v14M5 12h14"/>,
  saved: <path d="M6 4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17l-6-4-6 4Z"/>,
  trips: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3ZM9 3v15M15 6v15"/></>,
};

/** One five-destination navigation: labeled desktop menu and accessible icon-only mobile dock. */
export default function TravelNavigation({ active, hasTrip, canEdit, disabled = false, onNavigate }: {
  active: TravelSection; hasTrip: boolean; canEdit: boolean; disabled?: boolean;
  onNavigate: (section: TravelSection) => void;
}) {
  const { t } = useI18n();
  const labels = { packing: t("travel.packingTitle"), timeline: t("travel.timeline"), add: t("travel.navAdd"), saved: t("travel.navSaved"), trips: t("travel.navTrips") };
  return <nav className={styles.navigation} aria-label={t("travel.navigation")}>
    {sections.map(section => <button key={section} type="button" aria-label={labels[section]} title={labels[section]}
      aria-current={active === section ? "page" : undefined}
      className={section === "add" ? styles.add : undefined}
      disabled={disabled || (section !== "trips" && !hasTrip) || (section === "add" && !canEdit)}
      onClick={() => onNavigate(section)}>
      <span className={styles.icon}><svg viewBox="0 0 24 24" width="23" height="23" aria-hidden="true">{paths[section]}</svg></span>
      <span className={styles.text}>{labels[section]}</span>
    </button>)}
  </nav>;
}
