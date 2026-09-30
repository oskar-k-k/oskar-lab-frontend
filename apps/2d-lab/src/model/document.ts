import {
  addObject,
  parseScene,
  moveObject,
  type Scene2D,
} from "@oskar-lab/2d-lab/scene";
import {
  defaultMeasurements,
  parseMeasurements,
  type Measurements,
} from "@oskar-lab/2d-lab/measurements";

export type LabDocument = {
  format: "2d-lab";
  version: 1;
  scene: Scene2D;
  measurements: Measurements;
};
export const maximumDocumentBytes = 4 * 1024 * 1024;
/** Creates two separate, connected meshes to demonstrate object and topology selection. */
export function initialDocument(
  names = { rectangle: "Rectangle", triangle: "Triangle" },
): LabDocument {
  let scene = addObject(
    { version: 1, objects: [] },
    "rectangle",
    names.rectangle,
    "rectangle",
  );
  scene = moveObject(scene, "rectangle", { x: -2, y: 0 });
  scene = addObject(scene, "triangle", names.triangle, "triangle");
  scene = moveObject(scene, "triangle", { x: 2, y: 0 });
  return {
    format: "2d-lab",
    version: 1,
    scene,
    measurements: defaultMeasurements,
  };
}
/** Parses bounded, versioned project JSON and validates geometry and display preferences. */
export function parseDocument(text: string): LabDocument {
  if (text.length > maximumDocumentBytes) throw new Error("Document too large");
  const value: unknown = JSON.parse(text);
  if (!value || typeof value !== "object") throw new Error("Invalid document");
  const input = value as Record<string, unknown>;
  if (input.format !== "2d-lab" || input.version !== 1)
    throw new Error("Unsupported document");
  return {
    format: "2d-lab",
    version: 1,
    scene: parseScene(input.scene),
    measurements: parseMeasurements(input.measurements),
  };
}
