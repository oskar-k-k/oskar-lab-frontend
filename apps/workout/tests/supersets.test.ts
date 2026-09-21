import {describe, expect, it} from "vitest";
import {newEntry} from "../src/model/workout";
import {supersetPositions} from "../src/model/supersets";

describe("superset navigation", () => {
    const row = (superset = "") => ({...newEntry("repeated-exercise"), superset});
    it("keeps single exercises isolated instead of grouping empty labels", () => {
        expect(supersetPositions([row(), row()], 1)).toEqual([1]);
    });
    it("finds only the selected group and preserves plan positions", () => {
        expect(supersetPositions([row("7"), row("8"), row("7"), row("8")], 2)).toEqual([0, 2]);
    });
    it("supports groups larger than pairs and repeated catalog exercises", () => {
        expect(supersetPositions([row("7"), row("7"), row("7")], 1)).toEqual([0, 1, 2]);
    });
    it("handles stale positions and lone group labels", () => {
        expect(supersetPositions([row("7")], 0)).toEqual([0]);
        expect(supersetPositions([row()], 4)).toEqual([]);
    });
});
