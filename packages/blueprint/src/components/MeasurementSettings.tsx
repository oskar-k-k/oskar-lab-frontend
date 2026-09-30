"use client";

import { useI18n } from "@oskar-lab/i18n/I18nProvider";
import {
  formatLength,
  moveSteps,
  type Measurements,
} from "../model/measurements";
import styles from "./Blueprint.module.css";

/** Shares metric display units and physical movement increments across both workspaces. */
export default function MeasurementSettings({
  value,
  onChange,
}: {
  value: Measurements;
  onChange: (value: Measurements) => void;
}) {
  const { t, locale } = useI18n();
  return (
    <div className={styles.measurementSettings}>
      <label>
        {t("blueprint.unit")}
        <select
          value={value.unit}
          onChange={(event) =>
            onChange({
              ...value,
              unit: event.target.value as Measurements["unit"],
            })
          }
        >
          <option value="m">{t("blueprint.metres")}</option>
          <option value="cm">{t("blueprint.centimetres")}</option>
        </select>
      </label>
      <label>
        {t("blueprint.step")}
        <select
          value={value.step}
          onChange={(event) =>
            onChange({ ...value, step: Number(event.target.value) })
          }
        >
          {moveSteps.map((step) => (
            <option key={step} value={step}>
              {formatLength(step, value.unit, locale)}
            </option>
          ))}
        </select>
      </label>
      <label className={styles.snapToggle}>
        <input
          type="checkbox"
          checked={value.snap}
          onChange={(event) =>
            onChange({ ...value, snap: event.target.checked })
          }
        />
        {t("blueprint.snapEnabled")}
      </label>
    </div>
  );
}
