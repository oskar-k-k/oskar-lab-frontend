import type { ReactNode } from "react";
import styles from "./Timeline.module.css";

/** A neutral timeline item; callers own ordering, grouping and localized content. */
export type TimelineItem = Readonly<{
  /** Stable, document-unique ID, also usable as an anchor target. */
  id: string;
  /** Date, time or milestone label displayed alongside the content. */
  label: ReactNode;
  /** Arbitrary content, including headings, connected endpoints and actions. */
  content: ReactNode;
  /** Short visible heading for the collapsible bubble variant. */
  title?: ReactNode;
  /** Optional decorative image or illustration inside the circular bubble. No network requests are made by Timeline. */
  visual?: ReactNode;
}>;

/** Properties for a responsive, ordered sequence of milestones. */
export type TimelineProps = Readonly<{
  /** Items in display order; this component never sorts or interprets dates. */
  items: readonly TimelineItem[];
  /** Localized accessible name for the ordered list. */
  label: string;
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
      {items.map((item) => (
        <li
          className={styles.item}
          key={item.id}
          id={item.id}
          aria-current={item.id === currentItemId ? "step" : undefined}
        >
          {variant === "bubbles" ? (
            <details className={styles.disclosure} name={group}>
              <summary className={styles.summary}>
                <span className={styles.bubble} aria-hidden="true">
                  {item.visual ?? <span className={styles.fallback} />}
                </span>
                {item.title != null && (
                  <span className={styles.bubbleLabel}>{item.label}</span>
                )}
                <span className={styles.bubbleTitle}>
                  {item.title ?? item.label}
                </span>
              </summary>
              <div className={styles.revealed}>{item.content}</div>
            </details>
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
