import type { ReactNode } from "react";
import styles from "./Timeline.module.css";

/** A neutral timeline item; callers own ordering, grouping and localized content. */
export type TimelineStation = Readonly<{
  /** Stable, document-unique ID, also usable as an anchor target. */
  id: string;
  /** Date, time or milestone label; bubble view centers it on the vertical rail beside its station. */
  label: ReactNode;
  /** Arbitrary content, including headings, connected endpoints and actions. */
  content: ReactNode;
  /** Short visible heading for the collapsible bubble variant. */
  title?: ReactNode;
  /** Decorative image or illustration; callers own its media source and access policy. */
  visual?: ReactNode;
  /** Circle crops photos; illustration keeps freestanding artwork transparent and uncropped. */
  visualStyle?: "circle" | "illustration";
}>;

/** One timeline position, optionally with a connected second bubble on the same side. */
export type TimelineItem = TimelineStation &
  Readonly<{
    /** Optional second station in bubble view; both endpoints share one alternating position. */
    end?: TimelineStation;
    /** Localized duration or other relationship label on the downward connector. */
    connectionLabel?: ReactNode;
  }>;

/** Renders one independently expandable station within the shared disclosure group. */
function BubbleStation({
  station,
  group,
  anchor,
}: {
  station: TimelineStation;
  group: string | undefined;
  anchor?: string;
}) {
  return (
    <details id={anchor} className={styles.disclosure} name={group}>
      <summary className={styles.summary}>
        <span className={`${styles.bubble} ${station.visualStyle === "illustration" ? styles.illustration : ""}`} aria-hidden="true">
          {station.visual ?? <span className={styles.fallback} />}
        </span>
        {station.label != null && (
          <span className={styles.bubbleLabel}>{station.label}</span>
        )}
        {station.title != null && (
          <span className={styles.bubbleTitle}>{station.title}</span>
        )}
      </summary>
      <div className={styles.revealed}>{station.content}</div>
    </details>
  );
}

/** Properties for a responsive, ordered sequence of milestones. */
export type TimelineProps = Readonly<{
  /** Items in display order; this component never sorts or interprets dates. */
  items: readonly TimelineItem[];
  /** Localized accessible name for the ordered list. */
  label: string;
  /** Optional centered opening bubble; shown before stations in bubble view. */
  start?: ReactNode;
  /** Optional current milestone; exposes aria-current and a highlighted marker. */
  currentItemId?: string;
  /** Optional scoped theme or layout class; see the Timeline CSS variables. */
  className?: string;
  /** Cards show content immediately; bubbles alternate around a central rail and reveal content on activation. */
  variant?: "cards" | "bubbles";
}>;

/** Renders an accessible vertical timeline with cards or native keyboard-accessible bubble disclosures. */
export default function Timeline({
  items,
  label,
  currentItemId,
  start,
  className = "",
  variant = "cards",
}: TimelineProps) {
  const group = items.length ? `timeline-${items[0].id}` : undefined;
  return (
    <ol
      role="list"
      className={`${styles.timeline} ${variant === "bubbles" ? styles.bubbles : ""} ${className}`}
      aria-label={label}
    >
      {variant === "bubbles" && start != null && (
        <li className={styles.start}>{start}</li>
      )}
      {items.map((item, index) => (
        <li
          className={`${styles.item} ${index % 2 === 1 ? styles.alternate : ""}`}
          key={item.id}
          id={item.id}
          aria-current={item.id === currentItemId ? "step" : undefined}
        >
          {variant === "bubbles" ? (
            <div className={styles.stationGroup}>
              <BubbleStation station={item} group={group} />
              {item.end && (
                <>
                  <div className={styles.connection}>
                    {item.connectionLabel != null && (
                      <span>{item.connectionLabel}</span>
                    )}
                  </div>
                  <BubbleStation
                    station={item.end}
                    group={group}
                    anchor={item.end.id}
                  />
                </>
              )}
            </div>
          ) : (
            <>
              <div className={styles.label}>{item.label}</div>
              <div className={styles.track} aria-hidden="true">
                <span className={styles.marker} />
              </div>
              <div className={styles.content}>{item.content}</div>
            </>
          )}
        </li>
      ))}
    </ol>
  );
}
