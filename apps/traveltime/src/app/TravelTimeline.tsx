"use client";
import { useI18n } from "@oskar-lab/i18n/I18nProvider";
import type { TranslationKey } from "@oskar-lab/i18n/messages";
import type { Entry } from "./TravelWorkspace";
import {
  timelineRows,
  flightDuration,
  pointUtcOffset,
  timelinePoint,
  stayNights,
} from "../model/timeline";
import Timeline from "@oskar-lab/ui/Timeline/Timeline";
import BookingDetails from "./BookingDetails";
import BookingVisual from "./BookingVisual";
import StationCaption from "./StationCaption";
import styles from "./Travel.module.css";
/** Renders connected transports and interleaved stay points without owning API state. */
export default function TravelTimeline({
  entries,
  trip,
  loading,
  editable,
  editing = false,
  disabled,
  onDocuments,
  onEdit,
  onDelete,
  onEditTime,
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
  onEditTime?: (entry: Entry, point: Entry["points"][number]) => void;
}) {
  const { t, locale } = useI18n();
  const label = (key: string) => t(("travel." + key) as TranslationKey);
  const rows = timelineRows(entries);
  const stays = entries.filter(entry => entry.type === "HOTEL" || entry.type === "APARTMENT");
  const tripDate = (value: string) =>
    `${value.slice(8, 10)}.${value.slice(5, 7)}.${value.slice(0, 4)}`;
  return (
    <>
      <Timeline
        start={trip && (
          <>
            <h1 className={styles.tripTitle}>{trip.title}</h1>
            <span className={styles.tripDates}>
              {tripDate(trip.startDate)} — {tripDate(trip.endDate)}
            </span>
          </>
        )}
        variant="bubbles"
        className={`${styles.timeline} ${trip && /\bthailand\b/i.test(trip.title) ? styles.destinationTimeline : ""}`}
        label={label("timeline")}
        ranges={stays.map(entry => ({
          fromItemId: `booking-${entry.id}-CHECK_IN`,
          toItemId: `booking-${entry.id}-CHECK_OUT`,
          label: `${new Intl.NumberFormat(locale).format(stayNights(entry))} ${label(stayNights(entry) === 1 ? "night" : "nights")}`,
        }))}
        items={rows.map((row) => {
          const point = row.points[0];
          const stay = row.entry.type === "HOTEL" || row.entry.type === "APARTMENT";
          const visualStyle: "illustration" | "circle" =
            ["FLIGHT", "BOAT", "HOTEL", "APARTMENT"].includes(row.entry.type)
              ? "illustration" : "circle";
          const paired =
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
                  {p.time.slice(0, 5)}
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
                  <StationCaption type={row.entry.type} point={point} />
                )}
              </>
            ),
            visual: <BookingVisual type={row.entry.type} role={point.role} />,
            visualStyle,
            side: (stay ? "left" : stays.some(s => s.points[0].date <= point.date && s.points.at(-1)!.date >= point.date) ? "right" : undefined) as "left" | "right" | undefined,
            label:
              stationLabel(point),
            onLabelActivate: editing && editable && onEditTime ? () => onEditTime(row.entry, point) : undefined,
            labelActionName: label("editDateTime") + " · " + point.placeName + " · " + label(point.role),
            labelActionDisabled: disabled,
            content: (
              <BookingDetails
                entry={row.entry}
                entries={entries}
                points={paired ? [point] : row.points}
                editing={false}
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
                  <StationCaption type={row.entry.type} point={arrival} />
                </>
              ),
              label: stationLabel(arrival),
              onLabelActivate: editing && editable && onEditTime ? () => onEditTime(row.entry, arrival) : undefined,
              labelActionName: label("editDateTime") + " · " + arrival.placeName + " · " + label(arrival.role),
              labelActionDisabled: disabled,
              visual: <BookingVisual type={row.entry.type} role={arrival.role} />,
              visualStyle,
              content: (
                <BookingDetails
                  entry={row.entry}
                  entries={entries}
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
