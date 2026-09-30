export type Unit = "m" | "cm";
export type Measurements = { unit: Unit; step: number; snap: boolean };
export const moveSteps = [0.01, 0.05, 0.1, 0.25, 0.5, 1] as const;
export const defaultMeasurements: Measurements = {
  unit: "m",
  step: 0.1,
  snap: true,
};

/** Converts stored metres to the selected display unit without changing geometry. */
export function toDisplay(metres: number, unit: Unit): number {
  return Number((metres * (unit === "cm" ? 100 : 1)).toFixed(4));
}

/** Converts user-entered dimensions back to metres. */
export function fromDisplay(value: number, unit: Unit): number {
  return value / (unit === "cm" ? 100 : 1);
}

/** Formats lengths consistently in the current locale and selected metric unit. */
export function formatLength(
  metres: number,
  unit: Unit,
  locale: string,
): string {
  return `${toDisplay(metres, unit).toLocaleString(locale, { maximumFractionDigits: unit === "cm" ? 1 : 3 })} ${unit}`;
}

/** Formats floor area in the same metric system as the rest of the planner. */
export function formatArea(
  squareMetres: number,
  unit: Unit,
  locale: string,
): string {
  return `${(squareMetres * (unit === "cm" ? 10000 : 1)).toLocaleString(locale, { maximumFractionDigits: 2 })} ${unit}²`;
}

/** Rounds dragging coordinates using a physical step independent of display units. */
export function snapCoordinate(value: number, settings: Measurements): number {
  const step = settings.snap ? settings.step : 0.001;
  return Number((Math.round(value / step) * step).toFixed(4));
}

/** Rejects unsupported measurement preferences at the storage boundary. */
export function parseMeasurements(value: unknown): Measurements {
  if (!value || typeof value !== "object")
    throw new Error("Invalid measurements");
  const input = value as Record<string, unknown>;
  if (
    (input.unit !== "m" && input.unit !== "cm") ||
    typeof input.snap !== "boolean" ||
    !moveSteps.some((step) => step === input.step)
  )
    throw new Error("Invalid measurements");
  return { unit: input.unit, step: input.step as number, snap: input.snap };
}
