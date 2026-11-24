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
}>;

/** Renders an accessible vertical timeline without project logic or client-side state. */
export default function Timeline({
  items,
  label,
  currentItemId,
  className = "",
}: TimelineProps) {
  return (
    <ol
      role="list"
      className={`${styles.timeline} ${className}`}
      aria-label={label}
    >
      {items.map((item) => (
        <li
          className={styles.item}
          key={item.id}
          id={item.id}
          aria-current={item.id === currentItemId ? "step" : undefined}
        >
          <div className={styles.label}>{item.label}</div>
          <div className={styles.track} aria-hidden="true">
            <span className={styles.marker} />
          </div>
          <div className={styles.content}>{item.content}</div>
        </li>
      ))}
    </ol>
  );
}
