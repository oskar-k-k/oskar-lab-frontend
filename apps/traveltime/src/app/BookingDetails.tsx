"use client";
import { useI18n } from "@oskar-lab/i18n/I18nProvider";
import type { TranslationKey } from "@oskar-lab/i18n/messages";
import type { Entry } from "./TravelWorkspace";
import { pointUtcOffset } from "../model/timeline";
import PlaceMap from "./PlaceMap";
import styles from "./Travel.module.css";

/** Shows only the supplied station points while keeping shared booking actions together. */
export default function BookingDetails({
  entry,
  points,
  editing,
  editable,
  disabled,
  onDocuments,
  onEdit,
  onDelete,
}: {
  entry: Entry;
  points: Entry["points"];
  editing: boolean;
  editable: boolean;
  disabled: boolean;
  onDocuments: (entry: Entry) => void;
  onEdit: (entry: Entry) => void;
  onDelete: (entry: Entry) => void;
}) {
  const { t, locale } = useI18n();
  const label = (key: string) => t(("travel." + key) as TranslationKey);
  const date = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(value + "T12:00:00Z"));
  return (
    <article className={editing ? styles.card : styles.bookingDetails}>
      <div className={styles.eyebrow}>
        {label(entry.type)} ·{" "}
        {points.length === 1
          ? label(points[0].role)
          : entry.durationMinutes !== null
            ? `${Math.floor(entry.durationMinutes / 60)}h ${entry.durationMinutes % 60} ${label("minutes")}`
            : ""}
      </div>
      <h2>{entry.title}</h2>
      {entry.bookingSource && <p className={styles.bookingSource}>{label("bookedVia")} <strong>{entry.bookingSource}</strong></p>}
      <div className={styles.endpoints}>
        {points.map((p) => (
          <div key={p.role}>
            <small>{label(p.role)}</small>
            {(p.role === "CHECK_IN" || p.role === "CHECK_OUT") && p.timelineTime && <p>
              {label(p.role === "CHECK_IN" ? "plannedArrival" : "plannedDeparture")}: {p.timelineTime.slice(0, 5)}
            </p>}
            <strong>
              {p.time
                ? `${p.timeMeaning !== "EXACT" ? label(p.timeMeaning) + " " : ""}${p.time.slice(0, 5)}`
                : label("unknown")}
            </strong>
            <span>{date(p.date)}</span>
            <span>{p.placeName}</span>
            <small>{p.address}</small>
            <small>
              {p.timeZone}
              {pointUtcOffset(p) ? " · " + pointUtcOffset(p) : ""}
            </small>
            <PlaceMap key={p.placeName + p.address + p.mapEmbedUrl} placeName={p.placeName} address={p.address} mapEmbedUrl={p.mapEmbedUrl} />
          </div>
        ))}
      </div>
      <details>
        <summary>{label("notes")}</summary>
        {entry.reference && (
          <p>
            {label("reference")}: {entry.reference}
          </p>
        )}
        <p className={styles.notes}>{entry.notes}</p>
      </details>
      <div className={styles.actions}>
        {editing && <button onClick={() => onDocuments(entry)}>{label("documents")}</button>}
        {editable && (
          <>
            <button disabled={disabled} onClick={() => onEdit(entry)}>
              {label("edit")}
            </button>
            <button disabled={disabled} onClick={() => onDelete(entry)}>
              {label("delete")}
            </button>
          </>
        )}
      </div>
    </article>
  );
}
