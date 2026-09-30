import { describe, expect, it } from "vitest";
import {
  applySelectionAction,
  canApplySelectionAction,
  validSceneSelections,
} from "../src/model/selectionActions";
import {
  addObject,
  defaultEnginePolicy,
  type Scene2D,
  type SceneSelection,
} from "../src/model/scene";
import type { MeshSelection } from "../src/model/mesh";

function example() {
  return addObject(
    addObject({ version: 1, objects: [] }, "one", "One", "rectangle"),
    "two",
    "Two",
    "rectangle",
  );
}
function pick(
  kind: "vertex" | "edge" | "face",
  ids: string[],
  objectId = "one",
): SceneSelection[] {
  return ids.map((id) => ({ objectId, target: { kind, id } }));
}
function act(
  scene: Scene2D,
  targets: SceneSelection[],
  action: Parameters<typeof applySelectionAction>[2],
) {
  return applySelectionAction(scene, targets, action);
}
describe("selection wheel commands", () => {
  it("deletes selected vertices across objects and removes all dependent topology", () => {
    const scene = example();
    const next = act(
      scene,
      [...pick("vertex", ["vertex-1"]), ...pick("vertex", ["vertex-2"], "two")],
      "delete",
    ).scene;
    for (const object of next.objects) {
      expect(object.mesh.vertices).toHaveLength(3);
      expect(object.mesh.edges).toHaveLength(2);
      expect(object.mesh.faces).toHaveLength(0);
    }
    expect(scene.objects[0].mesh.faces).toHaveLength(1);
  });
  it("distinguishes deleting only edges from deleting their endpoints", () => {
    const scene = example(),
      targets = pick("edge", ["edge-1"]);
    const only = act(scene, targets, "delete").scene.objects[0].mesh;
    expect(only.vertices).toHaveLength(4);
    expect(only.edges).toHaveLength(3);
    expect(only.faces).toHaveLength(0);
    const withPoints = act(scene, targets, "deleteVertices").scene.objects[0]
      .mesh;
    expect(withPoints.vertices).toHaveLength(2);
    expect(withPoints.edges).toHaveLength(1);
  });
  it("distinguishes face, boundary and vertex deletion", () => {
    const scene = example(),
      targets = pick("face", ["face-1"]);
    expect(
      act(scene, targets, "delete").scene.objects[0].mesh.edges,
    ).toHaveLength(4);
    const boundary = act(scene, targets, "deleteBoundary").scene.objects[0]
      .mesh;
    expect(boundary.edges).toHaveLength(0);
    expect(boundary.vertices).toHaveLength(4);
    expect(
      act(scene, targets, "deleteVertices").scene.objects[0].mesh.vertices,
    ).toHaveLength(0);
  });
  it("subdivides adjacent selected edges at their midpoint and updates face boundaries", () => {
    const next = act(example(), pick("edge", ["edge-1", "edge-2"]), "split");
    const mesh = next.scene.objects[0].mesh;
    expect(mesh.vertices.slice(-2).map((v) => ({ x: v.x, y: v.y }))).toEqual([
      { x: 0, y: -1 },
      { x: 1.5, y: 0 },
    ]);
    expect(mesh.faces![0].vertices).toHaveLength(6);
    expect(next.selections).toHaveLength(2);
    expect(next.scene.objects[1].mesh.vertices).toHaveLength(4);
  });
  it("connects two vertices, but rejects existing edges and cross-object joins", () => {
    const scene = example();
    expect(
      act(scene, pick("vertex", ["vertex-1", "vertex-3"]), "connect").scene
        .objects[0].mesh.edges,
    ).toHaveLength(5);
    expect(
      canApplySelectionAction(
        scene,
        pick("vertex", ["vertex-1", "vertex-2"]),
        "connect",
      ),
    ).toBe(false);
    expect(() =>
      act(
        scene,
        [
          ...pick("vertex", ["vertex-1"]),
          ...pick("vertex", ["vertex-2"], "two"),
        ],
        "connect",
      ),
    ).toThrow();
  });
  it("creates faces from unordered points and automatically adds missing edges", () => {
    const scene = example();
    scene.objects[0].mesh.edges = [];
    scene.objects[0].mesh.faces = [];
    const next = act(
      scene,
      pick("vertex", ["vertex-1", "vertex-3", "vertex-2", "vertex-4"]),
      "face",
    );
    expect(next.scene.objects[0].mesh.edges).toHaveLength(4);
    expect(next.scene.objects[0].mesh.faces).toHaveLength(1);
    expect(scene.objects[0].mesh.faces).toHaveLength(0);
  });
  it("fills selected edge chains by closing the missing boundary", () => {
    const scene = act(example(), pick("face", ["face-1"]), "delete").scene;
    const next = act(scene, pick("edge", ["edge-2", "edge-1"]), "face");
    expect(next.scene.objects[0].mesh.faces![0].vertices).toHaveLength(3);
    expect(next.scene.objects[0].mesh.edges).toHaveLength(5);
    expect(
      canApplySelectionAction(
        scene,
        pick("edge", ["edge-1", "edge-3"]),
        "face",
      ),
    ).toBe(false);
  });
  it("rejects duplicate or degenerate faces and respects host limits atomically", () => {
    const scene = example(),
      targets = pick("vertex", [
        "vertex-1",
        "vertex-2",
        "vertex-3",
        "vertex-4",
      ]);
    expect(canApplySelectionAction(scene, targets, "face")).toBe(false);
    expect(() =>
      applySelectionAction(scene, pick("edge", ["edge-1", "edge-2"]), "split", {
        ...defaultEnginePolicy,
        mesh: { ...defaultEnginePolicy.mesh, maxVertices: 5 },
      }),
    ).toThrow();
    expect(scene.objects[0].mesh.vertices).toHaveLength(4);
    expect(
      canApplySelectionAction(
        scene,
        pick("vertex", ["vertex-1", "vertex-2", "vertex-3"]),
        "face",
        { ...defaultEnginePolicy, createFaces: false },
      ),
    ).toBe(false);
  });
  it("duplicates or deletes multiple independent objects as one action", () => {
    const scene = example(),
      targets = scene.objects.map((o) => ({
        objectId: o.id,
        target: null as MeshSelection,
      }));
    const copies = act(scene, targets, "duplicate");
    expect(copies.scene.objects).toHaveLength(4);
    expect(new Set(copies.scene.objects.map((o) => o.id)).size).toBe(4);
    expect(copies.selections).toHaveLength(2);
    expect(act(scene, targets, "delete").scene.objects).toHaveLength(0);
    expect(
      canApplySelectionAction(scene, targets, "duplicate", {
        ...defaultEnginePolicy,
        maxObjects: 3,
      }),
    ).toBe(false);
  });
  it("filters stale and duplicate selections without confusing object-local IDs", () => {
    const scene = example(),
      targets = pick("vertex", ["vertex-1"]);
    expect(
      validSceneSelections(scene, [
        ...targets,
        ...targets,
        ...pick("vertex", ["vertex-1"], "missing"),
        ...pick("vertex", ["vertex-1"], "two"),
      ]),
    ).toHaveLength(2);
  });
});
