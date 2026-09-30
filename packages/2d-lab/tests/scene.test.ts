import { describe, expect, it } from "vitest";
import {
  addObject,
  defaultEnginePolicy,
  exportSceneSvg,
  moveObject,
  parseScene,
  replaceObjectMesh,
  type Scene2D,
} from "../src/model/scene";
import { translateSelection } from "../src/model/mesh";

function example() {
  const scene = addObject(
    { version: 1, objects: [] },
    "one",
    "First",
    "rectangle",
  );
  return addObject(scene, "two", "Second", "triangle");
}
describe("independent scene objects", () => {
  it("moves an entire object without changing a neighbour or shared topology", () => {
    const scene = example();
    const moved = moveObject(scene, "one", { x: 3, y: -2 });
    expect(moved.objects[1]).toEqual(scene.objects[1]);
    expect(moved.objects[0].mesh.edges).toEqual(scene.objects[0].mesh.edges);
    expect(moved.objects[0].mesh.faces).toEqual(scene.objects[0].mesh.faces);
    expect(moved.objects[0].mesh.vertices[0].x).toBe(
      scene.objects[0].mesh.vertices[0].x + 3,
    );
    expect(scene.objects[0].mesh.vertices[0].x).toBe(-1.5);
  });
  it("updates one mesh without confusing vertex IDs reused by other objects", () => {
    let scene = example();
    scene = addObject(scene, "three", "Third", "rectangle");
    const mesh = translateSelection(
      scene.objects[0].mesh,
      { kind: "edge", id: "edge-1" },
      { x: 0, y: -0.5 },
    );
    const next = replaceObjectMesh(scene, "one", mesh);
    expect(next.objects[2]).toEqual(scene.objects[2]);
    expect(next.objects[0].mesh).toEqual(mesh);
  });
  it("enforces host limits for imports, additions and movement", () => {
    const policy = {
      ...defaultEnginePolicy,
      maxObjects: 1,
      createObjects: false,
    };
    expect(() => parseScene(example(), policy)).toThrow();
    expect(() =>
      addObject({ version: 1, objects: [] }, "a", "A", "empty", policy),
    ).toThrow();
    expect(() => moveObject(example(), "one", { x: 2000, y: 0 })).toThrow();
    expect(() => moveObject(example(), "one", { x: NaN, y: 0 })).toThrow();
  });
  it("rejects malformed files and duplicate object identities", () => {
    const scene = example();
    expect(() => parseScene({ ...scene, version: 2 })).toThrow();
    expect(() =>
      parseScene({ ...scene, objects: [scene.objects[0], scene.objects[0]] }),
    ).toThrow();
    expect(() =>
      parseScene({
        ...scene,
        objects: [
          {
            ...scene.objects[0],
            mesh: {
              vertices: [],
              edges: [{ id: "bad", start: "missing", end: "missing2" }],
            },
          },
        ],
      }),
    ).toThrow();
    expect(parseScene(JSON.parse(JSON.stringify(scene)))).toEqual(scene);
  });
  it("creates outlines without faces when the host disables face creation", () => {
    const scene = addObject({ version: 1, objects: [] }, "outline", "Outline", "triangle", { ...defaultEnginePolicy, createFaces: false });
    expect(scene.objects[0].mesh.edges).toHaveLength(3);
    expect(scene.objects[0].mesh.faces).toEqual([]);
  });
  it("exports escaped names, object groups, faces, edges and isolated points", () => {
    const scene = example();
    scene.objects[0].name = '<script>alert("x")</script>';
    const svg = exportSceneSvg(scene);
    expect(svg).toContain("&lt;script&gt;");
    expect(svg).not.toContain("<script>");
    expect(svg).toContain('<g id="one">');
    expect(svg).toContain('<g id="two">');
    expect(svg).toContain("<polygon");
    expect(svg).toContain("<line");
    const empty: Scene2D = { version: 1, objects: [] };
    expect(exportSceneSvg(empty)).toContain('viewBox="-2 -2 4 4"');
  });
});
