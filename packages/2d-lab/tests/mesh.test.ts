import { describe, expect, it } from "vitest";
import {
  closedOutline,
  connectedEdges,
  defaultConstraints,
  edgeLength,
  moveVertex,
  outlineArea,
  parseMesh,
  rectangleMesh,
  splitEdge,
  validateMesh,
  type Mesh2D,
} from "../src/model/mesh";
import {
  defaultMeasurements,
  fromDisplay,
  snapCoordinate,
  toDisplay,
} from "../src/model/measurements";

const branch: Mesh2D = {
  vertices: [
    { id: "a", x: 0, y: 0 },
    { id: "b", x: 2, y: 0 },
    { id: "c", x: 0, y: 2 },
    { id: "d", x: -2, y: 0 },
  ],
  edges: [
    { id: "ab", start: "a", end: "b" },
    { id: "ac", start: "a", end: "c" },
    { id: "ad", start: "a", end: "d" },
  ],
};
describe("independent Mesh2D graph", () => {
  it("accepts branching graphs by default and applies a consumer degree restriction", () => {
    expect(validateMesh(branch)).toBeNull();
    expect(connectedEdges(branch, "a")).toHaveLength(3);
    expect(validateMesh(branch, { ...defaultConstraints, maxDegree: 2 })).toBe(
      "connections",
    );
    expect(closedOutline(branch)).toBeNull();
  });
  it("lets the consuming product decide whether edges may cross", () => {
    const graph: Mesh2D = {
      vertices: [
        { id: "a", x: -1, y: -1 },
        { id: "b", x: 1, y: 1 },
        { id: "c", x: 1, y: -1 },
        { id: "d", x: -1, y: 1 },
      ],
      edges: [
        { id: "ab", start: "a", end: "b" },
        { id: "cd", start: "c", end: "d" },
      ],
    };
    expect(validateMesh(graph)).toBeNull();
    expect(
      validateMesh(graph, {
        ...defaultConstraints,
        allowIntersections: false,
      }),
    ).toBe("intersection");
  });
  it("round-trips plain JSON without retaining unknown fields or shared references", () => {
    const input = { ...branch, room: "not part of this model" };
    const restored = parseMesh(JSON.parse(JSON.stringify(input)));
    expect(restored).toEqual(branch);
    expect(restored).not.toBe(branch);
    expect(restored).not.toHaveProperty("room");
  });
  it("rejects malformed JSON, missing endpoints and duplicate connections", () => {
    for (const value of [
      null,
      { vertices: [], edges: [{}] },
      { ...branch, vertices: [{ id: "a", x: NaN, y: 0 }] },
      { ...branch, edges: [{ id: "bad", start: "a", end: "missing" }] },
      {
        ...branch,
        edges: [...branch.edges, { id: "duplicate", start: "b", end: "a" }],
      },
    ])
      expect(() => parseMesh(value)).toThrow();
  });
  it("enforces configurable coordinates, spacing and element limits", () => {
    expect(
      validateMesh(branch, { ...defaultConstraints, coordinateLimit: 1 }),
    ).toBe("coordinates");
    expect(
      validateMesh(branch, { ...defaultConstraints, minDistance: 3 }),
    ).toBe("shortEdge");
    expect(
      validateMesh(branch, { ...defaultConstraints, maxVertices: 3 }),
    ).toBe("limit");
    expect(() =>
      parseMesh(branch, { ...defaultConstraints, maxEdges: 2 }),
    ).toThrow();
  });
  it("moves a branch junction immutably, retaining edge identities", () => {
    const moved = moveVertex(branch, "a", { x: 0.5, y: 0.5 });
    expect(branch.vertices[0]).toEqual({ id: "a", x: 0, y: 0 });
    expect(moved.edges).toEqual(branch.edges);
    expect(edgeLength(moved, moved.edges[0])).toBeCloseTo(Math.sqrt(2.5));
  });
  it("splits edges while preserving the original edge id", () => {
    const split = splitEdge(branch, "ab", "middle", "new-edge");
    expect(split.vertices).toHaveLength(5);
    expect(split.edges[0]).toEqual({ id: "ab", start: "a", end: "middle" });
    expect(split.vertices.find((v) => v.id === "middle")).toEqual({
      id: "middle",
      x: 1,
      y: 0,
    });
  });
  it("measures closed outlines independently of array order and edge direction", () => {
    const graph = rectangleMesh(5, 4);
    graph.edges = graph.edges
      .reverse()
      .map((e) => ({ ...e, start: e.end, end: e.start }));
    expect(outlineArea(graph)).toBe(20);
    expect(closedOutline(graph)).toHaveLength(4);
    expect(outlineArea({ ...graph, edges: graph.edges.slice(1) })).toBeNull();
  });
  it("keeps physical snapping independent of display units", () => {
    const cm = { ...defaultMeasurements, unit: "cm" as const, step: 0.01 };
    expect(snapCoordinate(1.234, cm)).toBe(1.23);
    expect(toDisplay(1.23, "cm")).toBe(123);
    expect(fromDisplay(123, "cm")).toBe(1.23);
  });
});
