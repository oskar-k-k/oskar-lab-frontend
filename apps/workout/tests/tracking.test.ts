import {describe, expect, it} from "vitest";
import {completedSets, isExerciseLog, isSaveLog, trackingMode} from "../src/model/tracking";
import {newEntry} from "../src/model/workout";

const id = "4dcd07cd-46cb-4e54-9e7d-7aa8a94b0ce1";
describe("actual workout results", () => {
    it("records actual reps and holds without forcing target ranges", () => {
        expect(completedSets([{value: "12", weight: ""}, {value: "0", weight: ""}]))
            .toEqual([{setNumber: 1, value: 12, weight: null}, {setNumber: 2, value: 0, weight: null}]);
        expect(trackingMode({...newEntry(id), mode: "seconds"})).toBe("seconds");
        expect(trackingMode({...newEntry(id), trackingMode: "weighted"})).toBe("weighted");
    });
    it("keeps set numbers when skipping blank rows and accepts decimal weights", () => {
        expect(completedSets([{value: "", weight: ""}, {value: "8", weight: "12,5"}]))
            .toEqual([{setNumber: 2, value: 8, weight: 12.5}]);
        expect(completedSets([{value: "8", weight: "0"}])).not.toBeNull();
    });
    it("rejects incomplete, fractional, negative and empty sets", () => {
        for (const row of [{value: "", weight: "12"}, {value: "1.5", weight: "12"},
            {value: "-1", weight: "12"}, {value: "8", weight: "1.001"}, {value: "", weight: ""}])
            expect(completedSets([row])).toBeNull();
    });
    it("validates private write payloads and historic units", () => {
        const log = {id, exerciseId: id, trackingMode: "seconds", sets: [{setNumber: 1, value: 15, weight: null}]};
        expect(isSaveLog(log)).toBe(true);
        expect(isSaveLog({...log, sets: [...log.sets, ...log.sets]})).toBe(false);
        expect(isSaveLog({...log, trackingMode: "weighted"})).toBe(true);
        expect(isSaveLog({...log, exerciseId: "invalid"})).toBe(false);
        expect(isExerciseLog({...log, recordedAt: "2026-09-21T10:00:00Z"})).toBe(true);
        expect(isExerciseLog({...log, recordedAt: "invalid"})).toBe(false);
    });
    it("accepts optional weight per set for repetitions and holds without a plan", () => {
        const sets = completedSets([{value: "20", weight: ""}, {value: "15", weight: "5"}]);
        expect(sets).toEqual([{setNumber: 1, value: 20, weight: null}, {setNumber: 2, value: 15, weight: 5}]);
        for (const trackingMode of ["reps", "seconds"]) expect(isSaveLog({id, exerciseId: id, trackingMode, sets})).toBe(true);
    });

});
