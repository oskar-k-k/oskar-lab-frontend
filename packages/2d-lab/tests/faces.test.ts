import { describe, it, expect } from "vitest";
import {
  createFace,
  defaultConstraints,
  deleteSelection,
  faceArea,
  moveVertex,
  parseMesh,
  selectionCenter,
  splitEdge,
  translateSelection,
  validateMesh,
  type Mesh2D,
} from "../src/model/mesh";
function adjacent(): Mesh2D {
  let mesh: Mesh2D = {
    vertices: [
      { id: "a", x: -2, y: -1 },
      { id: "b", x: 0, y: -1 },
      { id: "c", x: 2, y: -1 },
      { id: "d", x: 2, y: 1 },
      { id: "e", x: 0, y: 1 },
      { id: "f", x: -2, y: 1 },
    ],
    edges: [],
  };
  mesh = createFace(mesh, ["a", "b", "e", "f"], "left");
  return createFace(mesh, ["b", "c", "d", "e"], "right");
}
describe("2D topology", () => {
  it("creates adjacent faces with one shared boundary edge", () => {
    const mesh = adjacent();
    expect(validateMesh(mesh)).toBeNull();
    expect(mesh.edges).toHaveLength(7);
    expect(mesh.faces).toHaveLength(2);
    expect(faceArea(mesh, mesh.faces![0])).toBe(4);
  });
  it("moves an edge's endpoints once and updates both neighbouring faces", () => {
    const mesh = adjacent();
    const edge = mesh.edges.find((e) => e.start === "b" && e.end === "e")!;
    const moved = translateSelection(
      mesh,
      { kind: "edge", id: edge.id },
      { x: 0.5, y: 0 },
    );
    expect(
      moved.vertices.filter((v) => ["b", "e"].includes(v.id)).map((v) => v.x),
    ).toEqual([0.5, 0.5]);
    expect(faceArea(moved, moved.faces![0])).toBe(5);
    expect(faceArea(moved, moved.faces![1])).toBe(3);
    expect(mesh.vertices.find((v) => v.id === "b")!.x).toBe(0);
    expect(moved.edges).toBe(mesh.edges);
    expect(moved.faces).toBe(mesh.faces);
  });
  it("moves all face vertices and lets shared topology follow", () => {
    const mesh = adjacent();
    const moved = translateSelection(
      mesh,
      { kind: "face", id: "left" },
      { x: 0.5, y: 0.25 },
    );
    for (const id of ["a", "b", "e", "f"]) {
      const before = mesh.vertices.find((v) => v.id === id)!;
      expect(moved.vertices.find((v) => v.id === id)).toEqual({
        ...before,
        x: before.x + 0.5,
        y: before.y + 0.25,
      });
    }
    expect(moved.vertices.find((v) => v.id === "c")).toBe(
      mesh.vertices.find((v) => v.id === "c"),
    );
    expect(selectionCenter(moved, { kind: "face", id: "left" })).toEqual({
      x: -0.5,
      y: 0.25,
    });
    expect(validateMesh(moved)).toBeNull();
  });
  it("moving a shared vertex changes all incident geometry", () => {
    const mesh = adjacent();
    const moved = moveVertex(mesh, "b", { x: 0.5, y: -1 });
    expect(faceArea(moved, moved.faces![0])).toBe(4.5);
    expect(faceArea(moved, moved.faces![1])).toBe(3.5);
  });
  it("subdivides a shared edge in both face rings, including reverse winding", () => {
    const mesh = adjacent();
    const edge = mesh.edges.find((e) => e.start === "b" && e.end === "e")!;
    const split = splitEdge(mesh, edge.id, "middle", "new-edge");
    expect(split.faces![0].vertices).toEqual(["a", "b", "middle", "e", "f"]);
    expect(split.faces![1].vertices).toEqual(["b", "c", "d", "e", "middle"]);
    expect(validateMesh(split)).toBeNull();
  });
  it("deletes faces without deleting their shared boundary", () => {
    const mesh = adjacent();
    const next = deleteSelection(mesh, { kind: "face", id: "left" });
    expect(next.faces?.map((f) => f.id)).toEqual(["right"]);
    expect(next.edges).toEqual(mesh.edges);
    expect(next.vertices).toEqual(mesh.vertices);
  });
  it("removes dependent faces when their vertex or boundary edge is deleted", () => {
    const mesh = adjacent();
    const edge = mesh.edges.find((e) => e.start === "b" && e.end === "e")!;
    expect(deleteSelection(mesh, { kind: "edge", id: edge.id }).faces).toEqual(
      [],
    );
    const next = deleteSelection(mesh, { kind: "vertex", id: "b" });
    expect(next.faces).toEqual([]);
    expect(validateMesh(next)).toBeNull();
  });
  it("validates face JSON and refuses crossed, duplicate or missing boundaries", () => {
    const mesh = adjacent();
    expect(parseMesh(JSON.parse(JSON.stringify(mesh)))).toEqual(mesh);
    for (const faces of [
      [{ id: "bad", vertices: ["a", "b", "absent"] }],
      [{ id: "bad", vertices: ["a", "a", "b"] }],
      [{ id: "bad", vertices: ["a", "e", "b", "f"] }],
      [mesh.faces![0], { ...mesh.faces![0], id: "duplicate" }],
    ])
      expect(() => parseMesh({ ...mesh, faces })).toThrow();
    expect(() => parseMesh({ ...mesh, faces: "invalid" })).toThrow();
    expect(validateMesh(mesh, { ...defaultConstraints, maxFaces: 1 })).toBe(
      "limit",
    );
  });
  it("rejects collapsed faces and moves beyond consumer bounds", () => {
    const mesh = adjacent();
    const collapsed = translateSelection(
      mesh,
      {
        kind: "edge",
        id: mesh.edges.find((e) => e.start === "b" && e.end === "e")!.id,
      },
      { x: 2, y: 0 },
    );
    expect(validateMesh(collapsed)).not.toBeNull();
    expect(
      validateMesh(
        translateSelection(mesh, { kind: "face", id: "left" }, { x: 20, y: 0 }),
        { ...defaultConstraints, coordinateLimit: 10 },
      ),
    ).toBe("coordinates");
  });
});
