import { expect, it } from "vitest";
import { initialDocument, parseDocument } from "../src/model/document";

it("round-trips scenes and centimetre settings without losing topology", () => {
  const document = initialDocument();
  document.measurements = { unit: "cm", step: 0.05, snap: false };
  expect(parseDocument(JSON.stringify(document))).toEqual(document);
});
it("rejects corrupt data, unsupported versions and invalid preferences", () => {
  expect(() => parseDocument("not json")).toThrow();
  expect(() =>
    parseDocument(JSON.stringify({ ...initialDocument(), version: 99 })),
  ).toThrow();
  expect(() =>
    parseDocument(
      JSON.stringify({
        ...initialDocument(),
        measurements: { unit: "ft", step: 0, snap: true },
      }),
    ),
  ).toThrow();
});
