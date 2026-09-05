import {describe, expect, it} from "vitest";
import {countDocumentedSymbols, filterDocumentation, filterReferences} from "../searchDocumentation";
import type {SourceDocumentation} from "@/lib/documentation/sourceDocumentation";

const documentation: SourceDocumentation[] = [{
    path: "src/core/Vector.ts",
    symbols: [{name: "Vector", kind: "class", signature: "class Vector", description: "Ein unveränderlicher Vektor.", members: [
        {name: "add", signature: "add(value: VectorLike): Vector", description: "Addiert einen Wert."},
        {name: "length", signature: "length(): number", description: "Berechnet die Länge."},
    ]}],
}];

describe("core reference search", () => {
    it("finds a documented member and keeps its parent symbol", () => {
        const result = filterDocumentation(documentation, "addiert");
        expect(result[0].symbols[0].name).toBe("Vector");
        expect(result[0].symbols[0].members.map(member => member.name)).toEqual(["add"]);
    });

    it("matches paths and counts symbols", () => {
        const result = filterDocumentation(documentation, "vector.ts");
        expect(countDocumentedSymbols(result)).toBe(1);
        expect(result[0].symbols[0].members).toHaveLength(2);
    });

    it("searches design titles, descriptions and keywords", () => {
        const references = [{id: "colors", title: "Farben & Tokens", description: "Globale Farbwerte", keywords: ["theme"]}];
        expect(filterReferences(references, "theme")).toEqual(references);
        expect(filterReferences(references, "globale theme")).toEqual(references);
    });
});
