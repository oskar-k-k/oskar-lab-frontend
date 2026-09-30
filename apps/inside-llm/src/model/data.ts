import {noise} from "./timeline";

export const OUTPUT_PROBABILITIES = [67, 19, 9, 5] as const;

/** Produces stable illustrative activations, updated twice per second for readable values. */
export function activationValue(layer: number, row: number, time: number): number {
    const step = Math.floor(Math.max(0, Math.min(60, time)) * 2) % 120;
    return Math.round((noise(layer * 251 + row * 17 + step * 101) * 2 - 1) * 999) / 100;
}

/** Formats a signed illustrative activation without locale-dependent width changes. */
export function formatActivation(value: number): string {
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}`;
}
