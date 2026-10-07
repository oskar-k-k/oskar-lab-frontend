import {expect, it} from "vitest";
import {availableWords, parseExtraWords, wordGroups} from "../src/app/words";
import {animalPictures} from "../src/app/animals";
it("offers 30 distinct animals with a picture for each", () => {
    expect(wordGroups.animals).toHaveLength(30);
    expect(new Set(wordGroups.animals).size).toBe(30);
    for (const animal of wordGroups.animals) expect(animalPictures[animal.toLowerCase()]).toBeTruthy();
});
it("mixes category and custom words without counting duplicates", () => {
    expect(availableWords("food", "pizza\n Lasagne \nLASAGNE\n")).toBe(11);
    expect(availableWords("", "Alpha\nBeta\nalpha")).toBe(2);
    expect(availableWords("", "\n  \n")).toBe(0);
    expect(parseExtraWords(" Alpha \r\n\nBeta")).toEqual(["Alpha", "Beta"]);
});
