import { expect, it } from "vitest";
import {
  addObject,
  defaultEnginePolicy,
  moveObject,
  moveSceneSelections,
  objectOrigin,
  parseScene,
  replaceObjectMesh,
  rotateSceneSelections,
  rotationPivot,
  setObjectOrigin,
  type SceneSelection,
} from "../src/model/scene";
import { applySelectionAction } from "../src/model/selectionActions";

const objectPick: SceneSelection[] = [{ objectId: "one", target: null }];
const example = () =>
  addObject({ version: 1, objects: [] }, "one", "One", "rectangle");

it("migrates legacy origins once and keeps them fixed during topology edits", () => {
  const source = example();
  delete source.objects[0].origin;
  source.objects[0].mesh.vertices = source.objects[0].mesh.vertices.map(
    (v) => ({ ...v, x: v.x + 5 }),
  );
  const parsed = parseScene(source);
  expect(parsed.objects[0].origin).toEqual({ x: 5, y: 0 });
  const mesh = {
    ...parsed.objects[0].mesh,
    vertices: parsed.objects[0].mesh.vertices.map((v) => ({
      ...v,
      x: v.x + 1,
    })),
  };
  expect(replaceObjectMesh(parsed, "one", mesh).objects[0].origin).toEqual({
    x: 5,
    y: 0,
  });
});

it("rotates a whole object around a custom origin without changing its topology", () => {
  const source = setObjectOrigin(example(), "one", { x: 2, y: 3 });
  const next = rotateSceneSelections(source, objectPick, 90);
  expect(next.objects[0].mesh.vertices[0]).toEqual({
    id: "vertex-1",
    x: 6,
    y: -0.5,
  });
  expect(next.objects[0].origin).toEqual({ x: 2, y: 3 });
  expect(next.objects[0].mesh.edges).toEqual(source.objects[0].mesh.edges);
  expect(rotateSceneSelections(next, objectPick, -90)).toEqual(source);
  expect(parseScene(JSON.parse(JSON.stringify(next)))).toEqual(next);
});

it("moves origins with objects, including empty objects, but not with selected vertices", () => {
  const source = example();
  expect(moveObject(source, "one", { x: 3, y: 4 }).objects[0].origin).toEqual({
    x: 3,
    y: 4,
  });
  const partial = moveSceneSelections(
    source,
    [{ objectId: "one", target: { kind: "vertex", id: "vertex-1" } }],
    { x: 3, y: 4 },
  );
  expect(partial.objects[0].origin).toEqual({ x: 0, y: 0 });
  const empty = addObject({ version: 1, objects: [] }, "one", "Empty", "empty");
  expect(moveObject(empty, "one", { x: 5, y: 6 }).objects[0].origin).toEqual({
    x: 5,
    y: 6,
  });
});

it("rotates edge endpoints about their midpoint, preserving other points and object origin", () => {
  const source = example();
  const picks: SceneSelection[] = [
    { objectId: "one", target: { kind: "edge", id: "edge-1" } },
  ];
  expect(rotationPivot(source, picks)).toEqual({ x: 0, y: -1 });
  const next = rotateSceneSelections(source, picks, 90);
  expect(next.objects[0].mesh.vertices[0]).toEqual({
    id: "vertex-1",
    x: 0,
    y: -2.5,
  });
  expect(next.objects[0].mesh.vertices[1]).toEqual({
    id: "vertex-2",
    x: 0,
    y: 0.5,
  });
  expect(next.objects[0].mesh.vertices[2]).toEqual(
    source.objects[0].mesh.vertices[2],
  );
  expect(next.objects[0].origin).toEqual({ x: 0, y: 0 });
});

it("uses unique selected points for adjacent edges and supports two-point selections", () => {
  const source = example();
  const edges: SceneSelection[] = [
    { objectId: "one", target: { kind: "edge", id: "edge-1" } },
    { objectId: "one", target: { kind: "edge", id: "edge-2" } },
  ];
  const points: SceneSelection[] = [1, 2, 3].map((i) => ({
    objectId: "one",
    target: { kind: "vertex", id: `vertex-${i}` },
  }));
  expect(rotateSceneSelections(source, edges, 45)).toEqual(
    rotateSceneSelections(source, points, 45),
  );
  expect(rotationPivot(source, points.slice(0, 1))).toBeNull();
  expect(rotationPivot(source, points.slice(0, 2))).toEqual({ x: 0, y: -1 });
});

it("rotates groups about mean origins and offsets duplicate origins", () => {
  let source = addObject(example(), "two", "Two", "rectangle");
  source = moveObject(source, "two", { x: 4, y: 0 });
  const picks = [...objectPick, { objectId: "two", target: null }];
  expect(rotationPivot(source, picks)).toEqual({ x: 2, y: 0 });
  const next = rotateSceneSelections(source, picks, 180);
  expect(next.objects.map(objectOrigin)).toEqual([
    { x: 4, y: 0 },
    { x: 0, y: 0 },
  ]);
  const copy = applySelectionAction(source, objectPick, "duplicate");
  expect(copy.scene.objects[1].origin).toEqual({ x: 0.5, y: 0.5 });
});

it("validates origins and rotation atomically against host policy", () => {
  const source = example();
  expect(() => setObjectOrigin(source, "one", { x: NaN, y: 0 })).toThrow();
  expect(() => rotateSceneSelections(source, objectPick, Infinity)).toThrow();
  expect(() =>
    rotateSceneSelections(source, objectPick, 45, {
      ...defaultEnginePolicy,
      mesh: { ...defaultEnginePolicy.mesh, coordinateLimit: 1.5 },
    }),
  ).toThrow();
  expect(source).toEqual(example());
});
