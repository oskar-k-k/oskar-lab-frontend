"use client";
import { useState } from "react";
import { useI18n } from "@oskar-lab/i18n/I18nProvider";
import type { TranslationKey } from "@oskar-lab/i18n/messages";
import type { components } from "@oskar-lab/api/backend";
import type { Entry } from "./TravelWorkspace";
import { parseMapEmbedUrl } from "../model/maps";
import styles from "./Travel.module.css";
type Point = components["schemas"]["TravelPoint"];
type Input = components["schemas"]["TravelSaveEntry"];
const kinds: Input["type"][] = [
  "FLIGHT",
  "BOAT",
  "TRAIN",
  "BUS",
  "TRANSFER",
  "HOTEL",
  "APARTMENT",
  "ACTIVITY",
  "RESTAURANT",
  "TOUR",
];
/** Edits one booking atomically, keeping unknown times and hotel time windows explicit. */
export default function BookingForm({
  entry,
  startDate,
  busy,
  onSave,
  onCancel,
}: {
  entry: Entry | null;
  startDate: string;
  busy: boolean;
  onSave: (input: Input) => Promise<void>;
  onCancel: () => void;
}) {
  const { t } = useI18n();
  const label = (key: string) => t(("travel." + key) as TranslationKey);
  const [type, setType] = useState<Input["type"]>(entry?.type ?? "FLIGHT");
  const [end, setEnd] = useState(entry?.points.length === 2);
  const stay = type === "HOTEL" || type === "APARTMENT",
    transport = ["FLIGHT", "BOAT", "TRAIN", "BUS", "TRANSFER"].includes(type);
  const roles: Point["role"][] = transport
    ? ["DEPARTURE", "ARRIVAL"]
    : stay
      ? ["CHECK_IN", "CHECK_OUT"]
      : end
        ? ["START", "END"]
        : ["START"];
  return (
    <form
      className={styles.panel}
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const points: Point[] = roles.map((role, index) => {
          const time = String(data.get(`time${index}`) ?? "");
          return {
            role,
            date: String(data.get(`date${index}`)),
            time: time || null,
            timeZone: String(data.get(`zone${index}`)),
            utcOffset: String(data.get(`offset${index}`) || "") || null,
            timeMeaning: time
              ? (String(data.get(`meaning${index}`)) as Point["timeMeaning"])
              : "UNSPECIFIED",
            placeName: String(data.get(`place${index}`)),
            address: String(data.get(`address${index}`) ?? ""),
            mapEmbedUrl: parseMapEmbedUrl(String(data.get(`map${index}`) ?? "")),
          };
        });
        void onSave({
          type,
          title: String(data.get("title")),
          notes: String(data.get("notes") ?? ""),
          reference: String(data.get("reference") ?? ""),
          bookingSource: String(data.get("bookingSource") ?? ""),
          points,
          version: entry?.version ?? 0,
        });
      }}
    >
      <h2>{label(entry ? "edit" : "add")}</h2>
      <fieldset disabled={busy}>
        <label>
          {label("type")}
          <select
            value={type}
            onChange={(event) => setType(event.target.value as Input["type"])}
          >
            {kinds.map((kind) => (
              <option key={kind} value={kind}>
                {label(kind)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {label("name")}
          <input
            name="title"
            required
            maxLength={200}
            defaultValue={entry?.title}
          />
        </label>
        {!stay && !transport && (
          <label>
            <input
              type="checkbox"
              checked={end}
              onChange={(event) => setEnd(event.target.checked)}
            />
            {label("withEnd")}
          </label>
        )}
        <div className={styles.columns}>
          {roles.map((role, index) => {
            const point = entry?.points.find((value) => value.role === role);
            return (
              <fieldset className={styles.point} key={role}>
                <legend>{label(role)}</legend>
                <label>
                  {label("date")}
                  <input
                    required
                    name={`date${index}`}
                    type="date"
                    defaultValue={point?.date ?? startDate}
                  />
                </label>
                <label>
                  {label("time")}
                  <input
                    name={`time${index}`}
                    type="time"
                    defaultValue={point?.time?.slice(0, 5)}
                  />
                </label>
                <label>
                  {label("meaning")}
                  <select
                    name={`meaning${index}`}
                    defaultValue={
                      point?.timeMeaning === "UNSPECIFIED"
                        ? "EXACT"
                        : (point?.timeMeaning ??
                          (role === "CHECK_IN"
                            ? "NOT_BEFORE"
                            : role === "CHECK_OUT"
                              ? "NOT_AFTER"
                              : "EXACT"))
                    }
                  >
                    <option value="EXACT">{label("EXACT")}</option>
                    {role === "CHECK_IN" && (
                      <option value="NOT_BEFORE">{label("NOT_BEFORE")}</option>
                    )}
                    {role === "CHECK_OUT" && (
                      <option value="NOT_AFTER">{label("NOT_AFTER")}</option>
                    )}
                  </select>
                </label>
                <label>
                  {label("zone")}
                  <input
                    name={`zone${index}`}
                    list={`travel-zones-${index}`}
                    required
                    maxLength={64}
                    defaultValue={
                      point?.timeZone ??
                      Intl.DateTimeFormat().resolvedOptions().timeZone
                    }
                  />
                </label>
                <datalist id={`travel-zones-${index}`}>
                  {[
                    "Europe/Berlin",
                    "Europe/London",
                    "Asia/Bangkok",
                    "Asia/Dubai",
                    "Asia/Tokyo",
                    "America/New_York",
                    "UTC",
                  ].map((zone) => (
                    <option value={zone} key={zone} />
                  ))}
                </datalist>
                <details>
                  <summary>{label("advancedTime")}</summary>
                  <label>
                    {label("offset")}
                    <input
                      name={`offset${index}`}
                      pattern="Z|[+-][0-9]{2}:[0-9]{2}"
                      defaultValue={point?.utcOffset ?? ""}
                    />
                  </label>
                </details>
                <label>
                  {label("place")}
                  <input
                    name={`place${index}`}
                    required
                    maxLength={200}
                    defaultValue={point?.placeName}
                  />
                </label>
                <label>
                  {label("address")}
                  <input
                    name={`address${index}`}
                    maxLength={1000}
                    defaultValue={point?.address}
                  />
                </label>
                <label>
                  {label("mapEmbedLink")}
                  <input
                    name={`map${index}`}
                    maxLength={16000}
                    defaultValue={point?.mapEmbedUrl ?? ""}
                    onChange={(event) => event.currentTarget.setCustomValidity(
                      event.currentTarget.value.trim() && !parseMapEmbedUrl(event.currentTarget.value)
                        ? label("invalidMapEmbed") : "",
                    )}
                    onBlur={(event) => {
                      const url = parseMapEmbedUrl(event.currentTarget.value);
                      if (url) event.currentTarget.value = url;
                    }}
                  />
                  <small>{label("mapEmbedHelp")}</small>
                </label>
              </fieldset>
            );
          })}
        </div>
        <label>
          {label("bookingSource")}
          <input name="bookingSource" maxLength={160} defaultValue={entry?.bookingSource ?? ""} />
        </label>
        <label>
          {label("reference")}
          <input
            name="reference"
            maxLength={120}
            defaultValue={entry?.reference}
          />
        </label>
        <label>
          {label("notes")}
          <textarea name="notes" maxLength={4000} defaultValue={entry?.notes} />
        </label>
        <div className={styles.actions}>
          <button className={styles.primary} disabled={busy}>
            {label("save")}
          </button>
          <button type="button" onClick={onCancel}>
            {label("cancel")}
          </button>
        </div>
      </fieldset>
    </form>
  );
}
