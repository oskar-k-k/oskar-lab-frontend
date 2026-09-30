import { expect, it } from "vitest";
import {
  addObject,
  constrainSelectionPivot,
  scaleSceneSelections,
  rotateSceneSelections,
  defaultEnginePolicy,
  type SceneSelection,
} from "../src/model/scene";
const example = () =>
  addObject({ version: 1, objects: [] }, "one", "One", "rectangle");
const pick = (kind: "edge" | "face", id: string): SceneSelection[] => [
  { objectId: "one", target: { kind, id } },
];
it("constrains edge pivots to the selected segment and its endpoints", () => {
  const scene = example(),
    selected = pick("edge", "edge-1");
  expect(constrainSelectionPivot(scene, selected, { x: 0.5, y: 20 })).toEqual({
    x: 0.5,
    y: -1,
  });
  expect(constrainSelectionPivot(scene, selected, { x: 50, y: 0 })).toEqual({
    x: 1.5,
    y: -1,
  });
});
it("allows face interiors and clamps outside positions to the boundary", () => {
  const scene = example(),
    selected = pick("face", scene.objects[0].mesh.faces![0].id);
  expect(constrainSelectionPivot(scene, selected, { x: 0.4, y: 0.7 })).toEqual({
    x: 0.4,
    y: 0.7,
  });
  expect(constrainSelectionPivot(scene, selected, { x: 10, y: 10 })).toEqual({
    x: 1.5,
    y: 1,
  });
  expect(constrainSelectionPivot(scene, [], { x: 0, y: 0 })).toBeNull();
});
it("scales only selected endpoints around a custom pivot without moving the origin", () => {
  const scene = example(),
    snapshot = JSON.stringify(scene);
  const result = scaleSceneSelections(
    scene,
    pick("edge", "edge-1"),
    { x: 2, y: 3 },
    defaultEnginePolicy,
    { x: -1.5, y: -1 },
  );
  expect(result.objects[0].mesh.vertices[0]).toEqual(
    scene.objects[0].mesh.vertices[0],
  );
  expect(result.objects[0].mesh.vertices[1]).toMatchObject({ x: 4.5, y: -1 });
  expect(result.objects[0].mesh.vertices[2]).toEqual(
    scene.objects[0].mesh.vertices[2],
  );
  expect(result.objects[0].origin).toEqual(scene.objects[0].origin);
  expect(JSON.stringify(scene)).toBe(snapshot);
});
it("transforms shared vertices once and whole object origins around temporary pivots", () => {
  const scene = example();
  const edges = [...pick("edge", "edge-1"), ...pick("edge", "edge-2")];
  expect(
    scaleSceneSelections(scene, edges, { x: 2, y: 2 }, defaultEnginePolicy, {
      x: 0,
      y: 0,
    }).objects[0].mesh.vertices[1],
  ).toMatchObject({ x: 3, y: -2 });
  const objects = [{ objectId: "one", target: null }];
  expect(
    scaleSceneSelections(scene, objects, { x: 2, y: 1 }, defaultEnginePolicy, {
      x: 1,
      y: 0,
    }).objects[0].origin,
  ).toEqual({ x: -1, y: 0 });
  expect(
    rotateSceneSelections(scene, objects, 90, defaultEnginePolicy, {
      x: 1,
      y: 0,
    }).objects[0].origin,
  ).toEqual({ x: 1, y: -1 });
});
it("allows collapse and mirroring but rejects nonfinite or constrained invalid scales atomically", () => {
  const scene = example(),
    objects = [{ objectId: "one", target: null }];
  expect(
    scaleSceneSelections(scene, objects, { x: 0, y: -1 }).objects[0].mesh
      .vertices[0],
  ).toMatchObject({ x: 0, y: 1 });
  expect(() =>
    scaleSceneSelections(scene, objects, { x: Infinity, y: 1 }),
  ).toThrow();
  const policy = {
    ...defaultEnginePolicy,
    mesh: { ...defaultEnginePolicy.mesh, coordinateLimit: 2 },
  };
  expect(() =>
    scaleSceneSelections(scene, objects, { x: 100, y: 1 }, policy),
  ).toThrow();
});
