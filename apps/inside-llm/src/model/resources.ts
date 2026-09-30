import {clampTime} from "./timeline";

/** Explicit reference assumptions, not measurements of the animation or a hosted assistant. */
export const RESOURCE_REFERENCE = {
    parameters: 8.2e9,
    energyWh: 0.24,
    coolingWaterMl: 0.26,
    carbonGrams: 0.03,
    assumedEuroPerKwh: 0.30,
} as const;

/** Estimates dense-model forward operations for an assumed short, uncached text exchange. */
export function resourceEstimate(value: number, inputTokens: number, outputTokens: number) {
    const time = clampTime(value);
    const prefill = Math.max(0, Math.min(1, (time - 3.4) / 44.6));
    const progress = Math.max(0, Math.min(1, (time - 3.4) / 55.6));
    const generated = Math.floor(Math.max(0, Math.min(1, (time - 51) / 8)) * outputTokens);
    const processedTokens = inputTokens * prefill + Math.max(0, generated - 1);
    return {
        generated,
        inputProcessed: Math.floor(inputTokens * prefill),
        energyWh: RESOURCE_REFERENCE.energyWh * progress,
        waterMl: RESOURCE_REFERENCE.coolingWaterMl * progress,
        carbonGrams: RESOURCE_REFERENCE.carbonGrams * progress,
        gigaFlops: 2 * RESOURCE_REFERENCE.parameters * processedTokens / 1e9,
        weightMemoryGb: RESOURCE_REFERENCE.parameters * 2 / 1e9,
        electricityEuro: RESOURCE_REFERENCE.energyWh / 1000 * RESOURCE_REFERENCE.assumedEuroPerKwh * progress,
    };
}
