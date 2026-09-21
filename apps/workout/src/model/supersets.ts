import type {Entry} from "./workout";

/** Returns related positions in plan order, keeping repeated exercises distinct. */
export function supersetPositions(entries: readonly Entry[], position: number): number[] {
    const entry = entries[position];
    if (!entry) return [];
    const group = entry.superset.trim();
    if (!group) return [position];
    return entries.flatMap((candidate, index) => candidate.superset.trim() === group ? [index] : []);
}
