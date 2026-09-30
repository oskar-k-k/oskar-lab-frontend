import * as lab2d from "@oskar-lab/2d-lab/model";

export type Point = { x: number; z: number };
export type Corner = Point & { id: string };
export type Wall = lab2d.Edge;
export type FloorPlan = { corners: Corner[]; walls: Wall[] };
export type PlanSelection = { kind: "corner" | "wall"; id: string } | null;
export type PlanError =
  "limit" | "coordinates" | "shortWall" | "intersection" | "connections";

/** Room-specific restrictions; the shared Mesh2D graph itself permits branches and crossings. */
export const roomConstraints: lab2d.MeshConstraints = {
  maxVertices: 64,
  maxEdges: 64,
  coordinateLimit: 10,
  minDistance: 0.05,
  maxDegree: 2,
  allowIntersections: false,
};
/** Maps persisted X/Z room coordinates to Mesh2D's independent X/Y plane. */
export function toMesh(plan: FloorPlan): lab2d.Mesh2D {
  return {
    vertices: plan.corners.map(({ id, x, z }) => ({ id, x, y: z })),
    edges: plan.walls.map((edge) => ({ ...edge })),
  };
}
/** Preserves room JSON compatibility and graph identities when accepting an editor change. */
export function fromMesh(value: lab2d.Mesh2D): FloorPlan {
  return {
    corners: value.vertices.map(({ id, x, y }) => ({ id, x, z: y })),
    walls: value.edges.map((edge) => ({ ...edge })),
  };
}
/** Creates a rectangular room outline in metres. */
export function rectanglePlan(width: number, depth: number): FloorPlan {
  const graph = lab2d.rectangleMesh(width, depth);
  const id = (value: string) => value.replace("vertex-", "corner-");
  return {
    corners: graph.vertices.map((v) => ({ id: id(v.id), x: v.x, z: v.y })),
    walls: graph.edges.map((e) => ({
      id: e.id.replace("edge-", "wall-"),
      start: id(e.start),
      end: id(e.end),
    })),
  };
}
/** Returns the room envelope, retaining the legacy X/Z naming contract. */
export function planBounds(plan: FloorPlan) {
  const b = lab2d.meshBounds(toMesh(plan));
  return {
    minX: b.minX,
    maxX: b.maxX,
    minZ: b.minY,
    maxZ: b.maxY,
    width: b.width,
    depth: b.height,
    centerX: b.centerX,
    centerZ: b.centerY,
  };
}
/** Measures a room wall in metres. */
export function wallLength(plan: FloorPlan, wall: Wall): number {
  return lab2d.edgeLength(toMesh(plan), wall);
}
/** Lists walls connected to a room corner. */
export function connectedWalls(plan: FloorPlan, id: string): Wall[] {
  return lab2d.connectedEdges(toMesh(plan), id);
}
/** Applies the room policy to open or closed drafts. */
export function validatePlan(plan: FloorPlan): PlanError | null {
  const error = lab2d.validateMesh(toMesh(plan), roomConstraints);
  return error === "shortEdge" ? "shortWall" : error === "faces" ? "connections" : error;
}
/** Returns one valid closed room boundary, with positive winding. */
export function closedOutline(plan: FloorPlan): Corner[] | null {
  if (validatePlan(plan)) return null;
  const graph = toMesh(plan);
  const area = lab2d.outlineArea(graph);
  if (area === null || area < 0.01) return null;
  return (
    lab2d.closedOutline(graph)?.map(({ id, x, y }) => ({ id, x, z: y })) ??
    null
  );
}
/** Returns enclosed room area only for a valid closed outline. */
export function floorArea(plan: FloorPlan): number | null {
  return closedOutline(plan) ? lab2d.outlineArea(toMesh(plan)) : null;
}
/** Moves a corner without mutating the persisted room graph. */
export function moveCorner(
  plan: FloorPlan,
  id: string,
  point: Point,
): FloorPlan {
  return fromMesh(
    lab2d.moveVertex(toMesh(plan), id, { x: point.x, y: point.z }),
  );
}
/** Inserts a corner in a room wall while retaining its original identity. */
export function splitWall(
  plan: FloorPlan,
  wallId: string,
  cornerId: string,
  newWallId: string,
): FloorPlan {
  return fromMesh(
    lab2d.splitEdge(toMesh(plan), wallId, cornerId, newWallId),
  );
}
/** Includes points on the room boundary. */
export function pointInside(point: Point, outline: Point[]): boolean {
  return lab2d.pointInside(
    { x: point.x, y: point.z },
    outline.map((p) => ({ x: p.x, y: p.z })),
  );
}
/** Checks the entire footprint against concave room boundaries. */
export function footprintInside(footprint: Point[], outline: Point[]): boolean {
  return lab2d.footprintInside(
    footprint.map((p) => ({ x: p.x, y: p.z })),
    outline.map((p) => ({ x: p.x, y: p.z })),
  );
}
/** Validates untrusted legacy room graph JSON through the shared parser and room policy. */
export function parseFloorPlan(value: unknown): FloorPlan {
  if (!value || typeof value !== "object")
    throw new Error("Invalid floor plan");
  const input = value as Record<string, unknown>;
  if (!Array.isArray(input.corners) || !Array.isArray(input.walls))
    throw new Error("Invalid floor plan");
  const vertices = input.corners.map((value: unknown) => {
    if (!value || typeof value !== "object") throw new Error("Invalid corner");
    const corner = value as Record<string, unknown>;
    return { id: corner.id, x: corner.x, y: corner.z };
  });
  return fromMesh(
    lab2d.parseMesh({ vertices, edges: input.walls }, roomConstraints),
  );
}
