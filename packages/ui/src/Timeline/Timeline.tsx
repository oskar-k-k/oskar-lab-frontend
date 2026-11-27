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
  /** Optional explicit side in bubble view, for relationships across intervening items. */
  side?: "left" | "right";
  /** Optional inline label action; does not toggle the station's detail disclosure. */
  onLabelActivate?: () => void;
  /** Localized accessible name required for an editable label. */
  labelActionName?: string;
  /** Disables label editing while a save or unavailable connection prevents changes. */
  labelActionDisabled?: boolean;
}>;

/** A visual relationship between two existing items without changing their chronological order. */
export type TimelineRange = Readonly<{
  fromItemId: string;
  toItemId: string;
  /** Localized relationship description, such as a calendar-night count. */
  label: ReactNode;
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
          station.onLabelActivate && station.labelActionName ?
            <button type="button" className={`${styles.bubbleLabel} ${styles.labelAction}`}
              aria-label={station.labelActionName} disabled={station.labelActionDisabled}
              onClick={event => { event.preventDefault(); event.stopPropagation(); station.onLabelActivate?.(); }}>
              {station.label}
            </button> : <span className={styles.bubbleLabel}>{station.label}</span>
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
  /** Connects same-side items while preserving any items between them. Invalid endpoints are ignored. */
  ranges?: readonly TimelineRange[];
}>;

/** Renders an accessible vertical timeline with cards or native keyboard-accessible bubble disclosures. */
export default function Timeline({
  items,
  label,
  currentItemId,
  start,
  className = "",
  variant = "cards",
  ranges = [],
}: TimelineProps) {
  const group = items.length ? `timeline-${items[0].id}` : undefined;
  const firstRow = start != null ? 2 : 1;
  const onLeft = (item: TimelineItem, index: number) => item.side ? item.side === "left" : index % 2 === 1;
  return (
    <ol
      role="list"
      className={`${styles.timeline} ${variant === "bubbles" ? styles.bubbles : ""} ${className}`}
      aria-label={label}
    >
      {variant === "bubbles" && start != null && (
        <li className={styles.start} style={{gridRow: 1}}>{start}</li>
      )}
      {items.map((item, index) => (
        <li
          className={`${styles.item} ${onLeft(item, index) ? styles.alternate : ""} ${ranges.some(range => range.fromItemId === item.id && range.toItemId === items[index + 1]?.id) ? styles.rangeStart : ""}`}
          style={variant === "bubbles" ? {gridRow: firstRow + index} : undefined}
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
      {variant === "bubbles" && ranges.map(range => {
        const from = items.findIndex(item => item.id === range.fromItemId);
        const to = items.findIndex(item => item.id === range.toItemId);
        if (from < 0 || to <= from || onLeft(items[from], from) !== onLeft(items[to], to)) return null;
        return <li role="presentation" key={`${range.fromItemId}-${range.toItemId}`}
          className={`${styles.range} ${onLeft(items[from], from) ? styles.alternate : ""}`}
          style={{gridRow: `${firstRow + from} / ${firstRow + to}`}}>
          <div className={styles.connection}><span>{range.label}</span></div>
        </li>;
      })}
    </ol>
  );
}
