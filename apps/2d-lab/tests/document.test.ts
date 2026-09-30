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

it("reloads freely edited collapsed geometry and far-away coordinates", () => {
  const document = initialDocument();
  document.scene.objects[0].mesh.vertices =
    document.scene.objects[0].mesh.vertices.map((v) => ({
      ...v,
      x: 5000,
      y: 5000,
    }));
  expect(parseDocument(JSON.stringify(document))).toEqual(document);
});
