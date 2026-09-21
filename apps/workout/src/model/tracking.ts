import type {Entry} from "./workout";

export type TrackingMode = "reps" | "seconds" | "weighted";
export type SetResult = {setNumber: number; value: number; weight: number | null};
export type SaveLog = {id: string; planId: string; planVersion: number; position: number; exerciseId: string; trackingMode: TrackingMode; sets: SetResult[]};
export type ExerciseLog = {id: string; exerciseId: string; planName: string; trackingMode: TrackingMode; recordedAt: string; sets: SetResult[]};
export type History = {entries: ExerciseLog[]; hasMore: boolean};
export type SetDraft = {value: string; weight: string};
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const uuid = (v: unknown): v is string => typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
const integer = (v: unknown, min: number, max: number): v is number => typeof v === "number" && Number.isSafeInteger(v) && v >= min && v <= max;
const mode = (v: unknown): v is TrackingMode => v === "reps" || v === "seconds" || v === "weighted";

/** Older prescriptions fall back to their planned unit; new plans persist an explicit type. */
export function trackingMode(entry: Entry): TrackingMode {
    return entry.trackingMode ?? (entry.mode === "seconds" ? "seconds" : "reps");
}
function validSets(v: unknown, unit: TrackingMode): v is SetResult[] {
    return Array.isArray(v) && v.length > 0 && v.length <= 100 && v.every((set, index) => object(set) &&
        integer(set.setNumber, 1, 100) && (index === 0 || set.setNumber > v[index - 1].setNumber) && integer(set.value, 0, 86400) &&
        (unit === "weighted" ? typeof set.weight === "number" && Number.isFinite(set.weight) && set.weight >= 0 && set.weight <= 10000 && Math.abs(set.weight * 100 - Math.round(set.weight * 100)) < 0.000001 : set.weight === null));
}
/** Validates actual set results at the browser/server boundary without enforcing target ranges. */
export function isSaveLog(v: unknown): v is SaveLog {
    return object(v) && uuid(v.id) && uuid(v.planId) && uuid(v.exerciseId) && integer(v.planVersion, 0, Number.MAX_SAFE_INTEGER) &&
        integer(v.position, 0, 99) && mode(v.trackingMode) && validSets(v.sets, v.trackingMode);
}
/** Validates historical units and values independently of today's prescription. */
export function isExerciseLog(v: unknown): v is ExerciseLog {
    return object(v) && uuid(v.id) && uuid(v.exerciseId) && typeof v.planName === "string" && v.planName.length <= 120 &&
        mode(v.trackingMode) && typeof v.recordedAt === "string" && Number.isFinite(Date.parse(v.recordedAt)) && validSets(v.sets, v.trackingMode);
}
/** Validates a bounded history page. */
export function isHistory(v: unknown): v is History {
    return object(v) && Array.isArray(v.entries) && v.entries.length <= 20 && v.entries.every(isExerciseLog) && typeof v.hasMore === "boolean";
}
/** Skips entirely blank rows, keeps original set numbers and rejects incomplete weighted sets. */
export function completedSets(rows: SetDraft[], unit: TrackingMode): SetResult[] | null {
    const results = rows.flatMap((row, index) => row.value.trim() === "" && row.weight.trim() === "" ? [] : [{
        setNumber: index + 1, value: row.value.trim() === "" ? NaN : Number(row.value),
        weight: unit === "weighted" ? row.weight.trim() === "" ? NaN : Number(row.weight.replace(",", ".")) : null,
    }]);
    return validSets(results, unit) ? results : null;
}
