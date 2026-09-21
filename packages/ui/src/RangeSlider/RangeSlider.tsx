"use client";

import {useId, type CSSProperties} from "react";
import styles from "./RangeSlider.module.css";

/** Controlled inclusive range. Equal endpoints represent a fixed value. */
export interface RangeSliderProps {
    label: string;
    minLabel: string;
    maxLabel: string;
    min: number;
    max: number;
    value: readonly [number, number];
    onChange: (value: [number, number]) => void;
    disabled?: boolean;
    /** Optional practical track limit; exact inputs still support the full maximum. */
    sliderMax?: number;
}

/** Two native keyboard-accessible handles plus exact numeric input; endpoints cannot cross. */
export default function RangeSlider({label, minLabel, maxLabel, min, max, value, onChange, disabled, sliderMax = max}: RangeSliderProps) {
    const id = useId();
    const trackMax = Math.min(max, Math.max(sliderMax, value[1], min + 1));
    const percent = (number: number) => 100 * (number - min) / (trackMax - min);
    function change(index: number, number: number) {
        if (!Number.isFinite(number)) return;
        const bounded = Math.max(min, Math.min(max, Math.round(number)));
        const next: [number, number] = index === 0 ? [Math.min(bounded, value[1]), value[1]] : [value[0], Math.max(bounded, value[0])];
        onChange(next);
        return next[index];
    }
    return <fieldset disabled={disabled} className={styles.range}>
        <legend>{label}</legend>
        <div className={styles.values}>
            {[minLabel, maxLabel].map((name, index) => <label key={index} htmlFor={`${id}-number-${index}`}>
                <span>{name}</span><input key={value[index]} id={`${id}-number-${index}`} type="number" inputMode="numeric" step="1"
                    min={index === 0 ? min : value[0]} max={index === 0 ? value[1] : max}
                    defaultValue={value[index]} onKeyDown={event => {if (event.key === "Enter") {event.preventDefault(); event.currentTarget.blur();}}} onBlur={event => {event.currentTarget.value = String(change(index, event.target.valueAsNumber) ?? value[index]);}} />
            </label>)}
        </div>
        <div className={styles.track} data-overlap={value[0] === value[1]} style={{"--low": `${percent(value[0])}%`, "--high": `${percent(value[1])}%`} as CSSProperties}>
            <div className={styles.rail} />
            {[minLabel, maxLabel].map((name, index) => <input key={index} className={styles.handle}
                aria-label={`${label}: ${name}`} type="range" min={min} max={trackMax} step="1" value={value[index]}
                aria-valuemin={index === 0 ? min : value[0]} aria-valuemax={index === 0 ? value[1] : trackMax}
                style={{zIndex: index === 0 && value[0] === trackMax ? 3 : index + 1}}
                onChange={event => change(index, event.target.valueAsNumber)} />)}
        </div>
    </fieldset>;
}
