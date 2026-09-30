import {describe, expect, it} from "vitest";
import {exampleEmbeddings, exampleModel, transformerBlock} from "../src/model/transformer";

describe("reduced causal transformer", () => {
    it("normalizes attention and prevents access to future tokens", () => {
        const block = transformerBlock(exampleEmbeddings(5));
        block.weights.forEach((row, token) => {
            expect(row.reduce((sum, value) => sum + value, 0)).toBeCloseTo(1);
            row.slice(token + 1).forEach(value => expect(value).toBe(0));
        });
    });
    it("keeps earlier outputs unchanged when a future token changes", () => {
        const input = exampleEmbeddings(5);
        const changed = input.map((vector, i) => i === 4 ? vector.map(value => value + 20) : vector);
        expect(transformerBlock(input).output.slice(0, 4)).toEqual(transformerBlock(changed).output.slice(0, 4));
    });
    it("passes complete finite representations between blocks", () => {
        const blocks = exampleModel();
        blocks.forEach((block, index) => {
            block.output.flat().forEach(value => expect(Number.isFinite(value)).toBe(true));
            if (index) expect(block.input).toEqual(blocks[index - 1].output);
        });
    });
});
