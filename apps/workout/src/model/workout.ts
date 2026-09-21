/** Catalog names are translated; user-authored plan names and notes are preserved. */
export type Exercise = {id: string; name: string; nameDe: string};
/** Prescription ranges are inclusive. Durations and rests use seconds. */
export type Entry = {
    exerciseId: string; setsMin: number; setsMax: number; mode: "reps" | "seconds" | "unspecified";
    targetMin: number | null; targetMax: number | null; restMin: number | null; restMax: number | null;
    superset: string; notes: string;
};
/** Array order is the exercise order. Version prevents stale updates. */
export type Plan = {id: string; version: number; name: string; notes: string; template: boolean; exercises: Entry[]};
export type PlanPage = {plans: Plan[]; hasMore: boolean};
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const integer = (v: unknown, min: number, max: number): v is number => typeof v === "number" && Number.isSafeInteger(v) && v >= min && v <= max;
const text = (v: unknown, max: number): v is string => typeof v === "string" && v.length <= max;
const range = (a: unknown, b: unknown, min: number) => a === null ? b === null : integer(a, min, 86400) && integer(b, min, 86400) && a <= b;

/** Validates catalog payloads before rendering server data. */
export function isExercise(v: unknown): v is Exercise {
    return object(v) && typeof v.id === "string" && uuid.test(v.id) && text(v.name, 120) && text(v.nameDe, 120);
}
/** Validates a complete prescription, including compatible targets and ordered ranges. */
export function isEntry(v: unknown): v is Entry {
    return object(v) && typeof v.exerciseId === "string" && uuid.test(v.exerciseId) &&
        integer(v.setsMin, 1, 100) && integer(v.setsMax, 1, 100) && v.setsMin <= v.setsMax &&
        (v.mode === "unspecified" ? v.targetMin === null && v.targetMax === null :
            (v.mode === "seconds" || v.mode === "reps") && v.targetMin !== null && range(v.targetMin, v.targetMax, 1)) &&
        range(v.restMin, v.restMax, 0) && text(v.superset, 32) && text(v.notes, 1000);
}
/** Validates persisted plans and form drafts at HTTP boundaries. */
export function isPlan(v: unknown): v is Plan {
    return object(v) && typeof v.id === "string" && uuid.test(v.id) && integer(v.version, 0, Number.MAX_SAFE_INTEGER) &&
        text(v.name, 120) && !!v.name.trim() && text(v.notes, 2000) && typeof v.template === "boolean" &&
        Array.isArray(v.exercises) && v.exercises.length > 0 && v.exercises.length <= 100 && v.exercises.every(isEntry);
}
/** Validates the paginated personal plan response. */
export function isPlanPage(v: unknown): v is PlanPage {
    return object(v) && Array.isArray(v.plans) && v.plans.every(isPlan) && typeof v.hasMore === "boolean";
}
/** Creates a conservative draft; no repetitions or durations are invented. */
export function newEntry(exerciseId: string): Entry {
    return {exerciseId, setsMin: 1, setsMax: 1, mode: "unspecified", targetMin: null, targetMax: null, restMin: null, restMax: null, superset: "", notes: ""};
}
/** Moves a prescription immutably while preserving its parameters. */
export function moveEntry(entries: Entry[], from: number, to: number): Entry[] {
    if (from < 0 || to < 0 || from >= entries.length || to >= entries.length) return entries;
    const next = [...entries];
    const [entry] = next.splice(from, 1);
    next.splice(to, 0, entry);
    return next;
}
