import { useState } from "react";
import { useI18n } from "@oskar-lab/i18n/I18nProvider";
import { fromDisplay, toDisplay, type Unit } from "../model/measurements";
import styles from "./RoomStudio.module.css";

/** Commits a bounded measurement on blur or Enter, preserving the previous value for invalid input. */
export default function Measure({
  label,
  value,
  min,
  max,
  step = 0.1,
  onChange,
  unit,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void | boolean;
  unit?: Unit;
}) {
  const { t } = useI18n();
  const [invalid, setInvalid] = useState(false);
  const display = (value: number) => (unit ? toDisplay(value, unit) : value);
  return (
    <label className={styles.measure}>
      <span>
        {label}
        {unit ? ` (${unit})` : ""}
      </span>
      <input
        key={`${value}-${unit}`}
        type="number"
        defaultValue={Number(display(value).toFixed(3))}
        min={display(min)}
        max={display(max)}
        step={display(step)}
        aria-invalid={invalid}
        onBlur={(event) => {
          const entered = event.currentTarget.valueAsNumber;
          const next = unit ? fromDisplay(entered, unit) : entered;
          if (Number.isFinite(next) && next >= min && next <= max) {
            setInvalid(false);
            if (onChange(next) === false)
              event.currentTarget.value = event.currentTarget.defaultValue;
          } else {
            setInvalid(true);
            event.currentTarget.value = event.currentTarget.defaultValue;
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
      />
      {invalid && (
        <span role="alert">
          {t("room.numberRange", { min: display(min), max: display(max) })}
        </span>
      )}
    </label>
  );
}
