import * as blueprint from "@oskar-lab/blueprint/model";

export type Point = { x: number; z: number };
export type Corner = Point & { id: string };
export type Wall = blueprint.Edge;
export type FloorPlan = { corners: Corner[]; walls: Wall[] };
export type PlanSelection = { kind: "corner" | "wall"; id: string } | null;
export type PlanError =
  "limit" | "coordinates" | "shortWall" | "intersection" | "connections";

/** Room-specific restrictions; the shared Blueprint graph itself permits branches and crossings. */
export const roomConstraints: blueprint.BlueprintConstraints = {
  maxVertices: 64,
  maxEdges: 64,
  coordinateLimit: 10,
  minDistance: 0.05,
  maxDegree: 2,
  allowIntersections: false,
};
/** Maps persisted X/Z room coordinates to Blueprint's independent X/Y plane. */
export function toBlueprint(plan: FloorPlan): blueprint.Blueprint {
  return {
    vertices: plan.corners.map(({ id, x, z }) => ({ id, x, y: z })),
    edges: plan.walls.map((edge) => ({ ...edge })),
  };
}
/** Preserves room JSON compatibility and graph identities when accepting an editor change. */
export function fromBlueprint(value: blueprint.Blueprint): FloorPlan {
  return {
    corners: value.vertices.map(({ id, x, y }) => ({ id, x, z: y })),
    walls: value.edges.map((edge) => ({ ...edge })),
  };
}
/** Creates a rectangular room outline in metres. */
export function rectanglePlan(width: number, depth: number): FloorPlan {
  const graph = blueprint.rectangleBlueprint(width, depth);
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
  const b = blueprint.blueprintBounds(toBlueprint(plan));
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
  return blueprint.edgeLength(toBlueprint(plan), wall);
}
/** Lists walls connected to a room corner. */
export function connectedWalls(plan: FloorPlan, id: string): Wall[] {
  return blueprint.connectedEdges(toBlueprint(plan), id);
}
/** Applies the room policy to open or closed drafts. */
export function validatePlan(plan: FloorPlan): PlanError | null {
  const error = blueprint.validateBlueprint(toBlueprint(plan), roomConstraints);
  return error === "shortEdge" ? "shortWall" : error;
}
/** Returns one valid closed room boundary, with positive winding. */
export function closedOutline(plan: FloorPlan): Corner[] | null {
  if (validatePlan(plan)) return null;
  const graph = toBlueprint(plan);
  const area = blueprint.outlineArea(graph);
  if (area === null || area < 0.01) return null;
  return (
    blueprint.closedOutline(graph)?.map(({ id, x, y }) => ({ id, x, z: y })) ??
    null
  );
}
/** Returns enclosed room area only for a valid closed outline. */
export function floorArea(plan: FloorPlan): number | null {
  return closedOutline(plan) ? blueprint.outlineArea(toBlueprint(plan)) : null;
}
/** Moves a corner without mutating the persisted room graph. */
export function moveCorner(
  plan: FloorPlan,
  id: string,
  point: Point,
): FloorPlan {
  return fromBlueprint(
    blueprint.moveVertex(toBlueprint(plan), id, { x: point.x, y: point.z }),
  );
}
/** Inserts a corner in a room wall while retaining its original identity. */
export function splitWall(
  plan: FloorPlan,
  wallId: string,
  cornerId: string,
  newWallId: string,
): FloorPlan {
  return fromBlueprint(
    blueprint.splitEdge(toBlueprint(plan), wallId, cornerId, newWallId),
  );
}
/** Includes points on the room boundary. */
export function pointInside(point: Point, outline: Point[]): boolean {
  return blueprint.pointInside(
    { x: point.x, y: point.z },
    outline.map((p) => ({ x: p.x, y: p.z })),
  );
}
/** Checks the entire footprint against concave room boundaries. */
export function footprintInside(footprint: Point[], outline: Point[]): boolean {
  return blueprint.footprintInside(
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
  return fromBlueprint(
    blueprint.parseBlueprint({ vertices, edges: input.walls }, roomConstraints),
  );
}
