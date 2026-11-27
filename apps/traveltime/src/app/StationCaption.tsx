import { useI18n } from "@oskar-lab/i18n/I18nProvider";
import type { TranslationKey } from "@oskar-lab/i18n/messages";
import type { components } from "@oskar-lab/api/backend";
import { plannedTimeLabel } from "../model/point-time";
import styles from "./Travel.module.css";

/** Keeps an early planned airport arrival visibly distinct from the actual departure time. */
export default function StationCaption({ type, point }: {
  type: components["schemas"]["TravelEntry"]["type"];
  point: components["schemas"]["TravelPoint"];
}) {
  const { t } = useI18n();
  const label = (key: string) => t(("travel." + key) as TranslationKey);
  const plan = Boolean(point.timelineTime);
  const stay = point.role === "CHECK_IN" || point.role === "CHECK_OUT";
  const bookedTime = point.time && <>
    {plan && point.timelineDate && point.timelineDate !== point.date && `${point.date.slice(8,10)}.${point.date.slice(5,7)} · `}
    {point.timeMeaning === "NOT_BEFORE" ? label("policyFrom") + " " : point.timeMeaning === "NOT_AFTER" ? label("policyUntil") + " " : ""}
    {point.time.slice(0, 5)}{stay ? label("clockSuffix") : ""}
  </>;
  return <>
    <small className={styles.stationRole}>{label(plan ? plannedTimeLabel(type, point.role) : point.role)}{!plan && stay && point.time && <> {bookedTime}</>}</small>
    {plan && point.time && <small className={styles.stationBookedTime}>{label(point.role)} · {bookedTime}</small>}
  </>;
}
