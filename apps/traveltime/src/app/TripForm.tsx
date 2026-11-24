"use client";
import { useI18n } from "@oskar-lab/i18n/I18nProvider";
import type { components } from "@oskar-lab/api/backend";
import type { TranslationKey } from "@oskar-lab/i18n/messages";
import styles from "./Travel.module.css";
/** Creates or edits trip metadata while preserving the backend version contract. */
export default function TripForm({
  trip,
  busy,
  onSave,
  onCancel,
}: {
  trip: components["schemas"]["TravelTrip"] | null;
  busy: boolean;
  onSave: (input: components["schemas"]["TravelSaveTrip"]) => Promise<void>;
  onCancel: () => void;
}) {
  const { t } = useI18n();
  const label = (key: string) => t(("travel." + key) as TranslationKey);
  return (
    <form
      className={styles.panel}
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        void onSave({
          title: String(data.get("title")),
          startDate: String(data.get("startDate")),
          endDate: String(data.get("endDate")),
          notes: String(data.get("notes")),
          version: trip?.version ?? 0,
        });
      }}
    >
      <h2>{label(trip ? "edit" : "newTrip")}</h2>
      <fieldset disabled={busy}>
        <label>
          {label("name")}
          <input
            name="title"
            maxLength={160}
            required
            defaultValue={trip?.title}
          />
        </label>
        <div className={styles.columns}>
          <label>
            {label("startDate")}
            <input
              name="startDate"
              type="date"
              required
              defaultValue={trip?.startDate}
            />
          </label>
          <label>
            {label("endDate")}
            <input
              name="endDate"
              type="date"
              required
              defaultValue={trip?.endDate}
            />
          </label>
        </div>
        <label>
          {label("notes")}
          <textarea name="notes" maxLength={4000} defaultValue={trip?.notes} />
        </label>
        <div className={styles.actions}>
          <button className={styles.primary}>{label("save")}</button>
          <button type="button" onClick={onCancel}>
            {label("cancel")}
          </button>
        </div>
      </fieldset>
    </form>
  );
}
