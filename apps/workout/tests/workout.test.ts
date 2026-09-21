import {describe, expect, it} from "vitest";
import {isEntry, isPlan, moveEntry, newEntry, type Plan} from "../src/model/workout";

const id = "4dcd07cd-46cb-4e54-9e7d-7aa8a94b0ce1";
const entry = {...newEntry(id), setsMin: 2, setsMax: 3};
const plan: Plan = {id, name: "Session", notes: "", version: 0, template: false, exercises: [entry]};
describe("workout contracts and editing", () => {
    it("preserves unspecified holds without inventing targets", () => {
        expect(isPlan(plan)).toBe(true);
        expect(isEntry({...entry, mode: "seconds", targetMin: null, targetMax: null})).toBe(false);
        expect(isEntry({...entry, mode: "seconds", targetMin: 10, targetMax: 20})).toBe(true);
    });
    it("rejects partial, reversed, fractional and excessive ranges", () => {
        for (const changes of [{setsMin: 4}, {setsMax: 101}, {setsMin: 1.5}, {restMin: 60}, {restMin: 90, restMax: 60}, {mode: "reps", targetMin: 5, targetMax: 4}]) {
            expect(isEntry({...entry, ...changes})).toBe(false);
        }
        expect(isEntry({...entry, restMin: 0, restMax: 0})).toBe(true);
    });
    it("rejects invalid boundary data", () => {
        expect(isPlan({...plan, name: " "})).toBe(false);
        expect(isPlan({...plan, exercises: []})).toBe(false);
        expect(isPlan({...plan, exercises: Array(101).fill(entry)})).toBe(false);
        expect(isPlan({...plan, id: "bad"})).toBe(false);
        expect(isPlan(null)).toBe(false);
    });
    it("reorders repeated exercises without losing notes or mutating the source", () => {
        const entries = [{...entry, notes: "heavy"}, {...entry, notes: "light"}];
        const result = moveEntry(entries, 0, 1);
        expect(result.map(e => e.notes)).toEqual(["light", "heavy"]);
        expect(entries.map(e => e.notes)).toEqual(["heavy", "light"]);
        expect(moveEntry(entries, 0, -1)).toBe(entries);
    });
});
