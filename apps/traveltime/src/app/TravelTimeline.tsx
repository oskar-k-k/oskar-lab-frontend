"use client";
import { useI18n } from "@oskar-lab/i18n/I18nProvider";
import type { TranslationKey } from "@oskar-lab/i18n/messages";
import type { Entry } from "./TravelWorkspace";
import { timelineRows, nextTimelineRow } from "../model/timeline";
import Timeline from "@oskar-lab/ui/Timeline/Timeline";
import BookingVisual from "./BookingVisual";
import styles from "./Travel.module.css";
/** Renders connected transports and interleaved stay points without owning API state. */
export default function TravelTimeline({
  entries,
  now,
  loading,
  editable,
  editing = false,
  disabled,
  onDocuments,
  onEdit,
  onDelete,
}: {
  entries: Entry[];
  now: number;
  loading: boolean;
  editable: boolean;
  editing?: boolean;
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
  const rows = timelineRows(entries);
  const next = nextTimelineRow(rows, now);
  return (
    <>
      {editing && next && (
        <a
          className={styles.next}
          href={`#booking-${next.entry.id}-${next.points[0].role}`}
        >
          <small>{label("next")}</small>
          <strong>{next.entry.title} ↗</strong>
        </a>
      )}
      <Timeline
        variant={editing ? "cards" : "bubbles"}
        className={styles.timeline}
        label={label("timeline")}
        currentItemId={
          next ? `booking-${next.entry.id}-${next.points[0].role}` : undefined
        }
        items={rows.map((row, index) => {
          const point = row.points[0];
          return {
            id: `booking-${row.entry.id}-${point.role}`,
            title: (
              <>
                {row.entry.title}
                {row.points.length === 1 && (
                  <small className={styles.stationRole}>
                    {label(point.role)}
                  </small>
                )}
              </>
            ),
            visual: <BookingVisual type={row.entry.type} />,
            label:
              !editing ||
              index === 0 ||
              rows[index - 1].points[0].date !== point.date ? (
                <time
                  dateTime={point.date + (point.time ? "T" + point.time : "")}
                >
                  {new Intl.DateTimeFormat(locale, {
                    day: "numeric",
                    month: "short",
                    timeZone: "UTC",
                  }).format(new Date(point.date + "T12:00:00Z"))}
                  {point.time
                    ? " · " +
                      (point.timeMeaning !== "EXACT"
                        ? label(point.timeMeaning) + " "
                        : "") +
                      point.time.slice(0, 5)
                    : ""}
                </time>
              ) : null,
            content: (
              <article
                className={editing ? styles.card : styles.bookingDetails}
              >
                <div className={styles.eyebrow}>
                  {label(row.entry.type)} ·{" "}
                  {row.points.length === 1
                    ? label(point.role)
                    : row.entry.durationMinutes !== null
                      ? `${Math.floor(row.entry.durationMinutes / 60)}h ${row.entry.durationMinutes % 60} ${label("minutes")}`
                      : ""}
                </div>
                <h2>{row.entry.title}</h2>
                <div className={styles.endpoints}>
                  {row.points.map((p) => (
                    <div key={p.role}>
                      <small>{label(p.role)}</small>
                      <strong>
                        {p.time
                          ? `${p.timeMeaning !== "EXACT" ? label(p.timeMeaning) + " " : ""}${p.time.slice(0, 5)}`
                          : label("unknown")}
                      </strong>
                      <span>{date(p.date)}</span>
                      <span>{p.placeName}</span>
                      <small>{p.address}</small>
                      <small>{p.timeZone}</small>
                    </div>
                  ))}
                </div>
                <details>
                  <summary>{label("notes")}</summary>
                  {row.entry.reference && (
                    <p>
                      {label("reference")}: {row.entry.reference}
                    </p>
                  )}
                  <p className={styles.notes}>{row.entry.notes}</p>
                </details>
                <div className={styles.actions}>
                  <button onClick={() => onDocuments(row.entry)}>
                    {label("documents")}
                  </button>
                  {editable && (
                    <>
                      <button
                        disabled={disabled}
                        onClick={() => onEdit(row.entry)}
                      >
                        {label("edit")}
                      </button>
                      <button
                        disabled={disabled}
                        onClick={() => onDelete(row.entry)}
                      >
                        {label("delete")}
                      </button>
                    </>
                  )}
                </div>
              </article>
            ),
          };
        })}
      />
      {!loading && entries.length === 0 && (
        <section className={styles.empty}>
          <h2>{label("noEntries")}</h2>
          <p>{label("noEntriesText")}</p>
        </section>
      )}
    </>
  );
}
