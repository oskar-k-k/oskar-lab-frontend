import {expect, it} from "vitest";
import {availableWords, parseExtraWords} from "../src/app/words";
it("mixes category and custom words without counting duplicates", () => {
    expect(availableWords("food", "pizza\n Lasagne \nLASAGNE\n")).toBe(11);
    expect(availableWords("", "Alpha\nBeta\nalpha")).toBe(2);
    expect(availableWords("", "\n  \n")).toBe(0);
    expect(parseExtraWords(" Alpha \r\n\nBeta")).toEqual(["Alpha", "Beta"]);
});
