"use client";
import { useI18n } from "@oskar-lab/i18n/I18nProvider";
import type { TranslationKey } from "@oskar-lab/i18n/messages";
import type { Entry } from "./TravelWorkspace";
import {
  timelineRows,
  nextTimelineRow,
  flightDuration,
  pointUtcOffset,
  timelinePoint,
  stayNights,
} from "../model/timeline";
import Timeline from "@oskar-lab/ui/Timeline/Timeline";
import BookingDetails from "./BookingDetails";
import BookingVisual from "./BookingVisual";
import styles from "./Travel.module.css";
/** Renders connected transports and interleaved stay points without owning API state. */
export default function TravelTimeline({
  entries,
  trip,
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
  trip?: { title: string; startDate: string; endDate: string };
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
  const rows = timelineRows(entries);
  const next = nextTimelineRow(rows, now);
  const stays = entries.filter(entry => entry.type === "HOTEL" || entry.type === "APARTMENT");
  const tripDate = (value: string) =>
    `${value.slice(8, 10)}.${value.slice(5, 7)}.${value.slice(0, 4)}`;
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
        start={trip && (
          <>
            <h1 className={styles.tripTitle}>{trip.title}</h1>
            <span className={styles.tripDates}>
              {tripDate(trip.startDate)} — {tripDate(trip.endDate)}
            </span>
          </>
        )}
        variant={editing ? "cards" : "bubbles"}
        className={`${styles.timeline} ${trip && /\bthailand\b/i.test(trip.title) ? styles.destinationTimeline : ""}`}
        label={label("timeline")}
        currentItemId={
          next ? `booking-${next.entry.id}-${next.points[0].role}` : undefined
        }
        ranges={editing ? [] : stays.map(entry => ({
          fromItemId: `booking-${entry.id}-CHECK_IN`,
          toItemId: `booking-${entry.id}-CHECK_OUT`,
          label: `${new Intl.NumberFormat(locale).format(stayNights(entry))} ${label(stayNights(entry) === 1 ? "night" : "nights")}`,
        }))}
        items={rows.map((row, index) => {
          const point = row.points[0];
          const stay = row.entry.type === "HOTEL" || row.entry.type === "APARTMENT";
          const visualStyle: "illustration" | "circle" =
            ["FLIGHT", "BOAT", "HOTEL", "APARTMENT"].includes(row.entry.type)
              ? "illustration" : "circle";
          const paired =
            !editing &&
            (row.entry.type === "FLIGHT" || row.entry.type === "BOAT") &&
            row.points.length === 2;
          const stationLabel = (original: Entry["points"][number]) => {
            const p = timelinePoint(original);
            return (
            <span className={styles.stationTime} title={p.timeZone}>
              <time
                dateTime={
                  p.date + (p.time ? "T" + p.time + (p.utcOffset ?? "") : "")
                }
              >
                <span className={styles.stationDate}>{p.date.slice(8, 10) + "." + p.date.slice(5, 7)}</span>
                {p.time && <span className={styles.stationClock}>
                  {(p.timeMeaning !== "EXACT"
                      ? label(p.timeMeaning) + " "
                      : "") + p.time.slice(0, 5)}
                  {pointUtcOffset(p, true) && ` (${pointUtcOffset(p, true)})`}
                </span>}
              </time>
            </span>
            );
          };
          const item = {
            id: `booking-${row.entry.id}-${point.role}`,
            title: (
              <>
                {paired ? point.placeName : row.entry.title}
                {(row.points.length === 1 || paired) && (
                  <small className={styles.stationRole}>
                    {label(point.role)}
                  </small>
                )}
              </>
            ),
            visual: <BookingVisual type={row.entry.type} />,
            visualStyle,
            side: (stay ? "left" : stays.some(s => s.points[0].date <= point.date && s.points.at(-1)!.date >= point.date) ? "right" : undefined) as "left" | "right" | undefined,
            label:
              !editing ||
              index === 0 ||
              rows[index - 1].points[0].date !== point.date
                ? stationLabel(point)
                : null,
            content: (
              <BookingDetails
                entry={row.entry}
                points={paired ? [point] : row.points}
                editing={editing}
                editable={editable}
                disabled={disabled}
                onDocuments={onDocuments}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ),
          };
          if (!paired) return item;
          const arrival = row.points[1];
          return {
            ...item,
            label: stationLabel(point),
            connectionLabel:
              flightDuration(row.entry, locale) ?? label("unknownDuration"),
            end: {
              id: `booking-${row.entry.id}-${arrival.role}`,
              title: (
                <>
                  {arrival.placeName}
                  <small className={styles.stationRole}>
                    {label(arrival.role)}
                  </small>
                </>
              ),
              label: stationLabel(arrival),
              visual: <BookingVisual type={row.entry.type} />,
              visualStyle,
              content: (
                <BookingDetails
                  entry={row.entry}
                  points={[arrival]}
                  editing={false}
                  editable={editable}
                  disabled={disabled}
                  onDocuments={onDocuments}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ),
            },
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
