import { expect, it } from "vitest";
import { defaultConstraints, parseMesh } from "../src/model/mesh";
import {
  addObject,
  defaultEnginePolicy,
  exportSceneSvg,
  moveSceneSelections,
  parseScene,
  type Scene2D,
} from "../src/model/scene";

function rectangle() {
  return addObject({ version: 1, objects: [] }, "mesh", "Mesh", "rectangle");
}

it("moves vertices onto each other and through a face without rejecting intermediate shapes", () => {
  const scene = rectangle();
  const selection = [
    { objectId: "mesh", target: { kind: "vertex" as const, id: "vertex-1" } },
  ];
  for (const delta of [
    { x: 3, y: 0 },
    { x: 4, y: 2 },
    { x: 0, y: 2 },
  ]) {
    const moved = moveSceneSelections(scene, selection, delta);
    expect(moved.objects[0].mesh.vertices[0].x).toBe(-1.5 + delta.x);
    expect(moved.objects[0].mesh.faces).toEqual(scene.objects[0].mesh.faces);
    expect(parseScene(JSON.parse(JSON.stringify(moved)))).toEqual(moved);
    expect(exportSceneSvg(moved)).toContain("<polygon");
  }
  expect(() =>
    moveSceneSelections(
      scene,
      selection,
      { x: 3, y: 0 },
      { ...defaultEnginePolicy, mesh: defaultConstraints },
    ),
  ).toThrow();
});

it("allows collapsed, self-crossing faces, tiny distances and coordinates beyond the old limit", () => {
  for (const points of [
    [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ],
    [
      { x: 0, y: 0 },
      { x: 2, y: 2 },
      { x: 0, y: 2 },
      { x: 2, y: 0 },
    ],
    [
      { x: 10000, y: 0 },
      { x: 10000.00001, y: 0 },
      { x: 10000.00001, y: 0.00001 },
      { x: 10000, y: 0.00001 },
    ],
  ]) {
    const scene = rectangle();
    scene.objects[0].mesh.vertices = scene.objects[0].mesh.vertices.map(
      (v, i) => ({ ...v, ...points[i] }),
    );
    expect(parseScene(scene)).toEqual(scene);
    expect(() =>
      parseMesh(scene.objects[0].mesh, defaultConstraints),
    ).toThrow();
  }
});

it("removes arbitrary object, vertex and face-size caps in free scenes", () => {
  const source = rectangle().objects[0];
  const vertices = Array.from({ length: 600 }, (_, i) => ({
    id: `v${i}`,
    x: 0,
    y: 0,
  }));
  const scene: Scene2D = {
    version: 1,
    objects: Array.from({ length: 70 }, (_, i) => ({
      ...source,
      id: `object-${i}`,
      mesh: {
        vertices,
        edges: vertices.map((v, i) => ({
          id: `e${i}`,
          start: v.id,
          end: vertices[(i + 1) % vertices.length].id,
        })),
        faces: [{ id: "face", vertices: vertices.map((v) => v.id) }],
      },
    })),
  };
  expect(parseScene(scene)).toEqual(scene);
  expect(() =>
    parseScene(scene, { ...defaultEnginePolicy, maxObjects: 64 }),
  ).toThrow();
});

it("still rejects non-finite data and broken topology references", () => {
  const scene = rectangle();
  scene.objects[0].mesh.vertices[0].x = NaN;
  expect(() => parseScene(scene)).toThrow();
  scene.objects[0].mesh.vertices[0].x = 0;
  scene.objects[0].mesh.edges[0].end = "missing";
  expect(() => parseScene(scene)).toThrow();
});
