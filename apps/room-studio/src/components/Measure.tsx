import styles from "./RoomStudio.module.css";

/** Commits a bounded measurement on blur or Enter, preserving the previous value for invalid input. */
export default function Measure({
  label,
  value,
  min,
  max,
  step = 0.1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className={styles.measure}>
      <span>{label}</span>
      <input
        key={value}
        type="number"
        defaultValue={Number(value.toFixed(2))}
        min={min}
        max={max}
        step={step}
        onBlur={(event) => {
          const value = event.currentTarget.valueAsNumber;
          if (Number.isFinite(value) && value >= min && value <= max)
            onChange(value);
          else event.currentTarget.value = event.currentTarget.defaultValue;
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
      />
    </label>
  );
}
