export type Point = { x: number; y: number };
export type Vertex = Point & { id: string };
export type Edge = { id: string; start: string; end: string };
export type Blueprint = { vertices: Vertex[]; edges: Edge[] };
export type BlueprintSelection = { kind: "vertex" | "edge"; id: string } | null;
export type BlueprintError =
  "limit" | "coordinates" | "shortEdge" | "intersection" | "connections";
/** Validation policy supplied by the consuming product; values use stored metres. */
export type BlueprintConstraints = {
  maxVertices: number;
  maxEdges: number;
  coordinateLimit: number;
  minDistance: number;
  maxDegree: number;
  allowIntersections: boolean;
};
/** General drawing policy: supports open, disconnected and branching graphs. */
export const defaultConstraints: BlueprintConstraints = {
  maxVertices: 256,
  maxEdges: 512,
  coordinateLimit: 1000,
  minDistance: 0.001,
  maxDegree: 256,
  allowIntersections: true,
};

const epsilon = 1e-7;

/** Creates the four connected vertices of a centred rectangle. */
export function rectangleBlueprint(width: number, height: number): Blueprint {
  const vertices = [
    { id: "vertex-1", x: -width / 2, y: -height / 2 },
    { id: "vertex-2", x: width / 2, y: -height / 2 },
    { id: "vertex-3", x: width / 2, y: height / 2 },
    { id: "vertex-4", x: -width / 2, y: height / 2 },
  ];
  return {
    vertices,
    edges: vertices.map((vertex, index) => ({
      id: `edge-${index + 1}`,
      start: vertex.id,
      end: vertices[(index + 1) % 4].id,
    })),
  };
}

/** Returns the drawing envelope, including off-centre and unfinished plans. */
export function blueprintBounds(plan: Blueprint) {
  if (!plan.vertices.length)
    return {
      minX: -2.5,
      maxX: 2.5,
      minY: -2,
      maxY: 2,
      width: 5,
      height: 4,
      centerX: 0,
      centerY: 0,
    };
  const minX = Math.min(...plan.vertices.map((vertex) => vertex.x));
  const maxX = Math.max(...plan.vertices.map((vertex) => vertex.x));
  const minY = Math.min(...plan.vertices.map((vertex) => vertex.y));
  const maxY = Math.max(...plan.vertices.map((vertex) => vertex.y));
  return {
    minX,
    maxX,
    minY,
    maxY,
    width: Math.max(0.05, maxX - minX),
    height: Math.max(0.05, maxY - minY),
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
  };
}

/** Measures an edge in metres. */
export function edgeLength(plan: Blueprint, edge: Edge): number {
  const start = plan.vertices.find((vertex) => vertex.id === edge.start);
  const end = plan.vertices.find((vertex) => vertex.id === edge.end);
  return start && end ? Math.hypot(end.x - start.x, end.y - start.y) : 0;
}

/** Lists the edges incident to a vertex without assuming array order. */
export function connectedEdges(plan: Blueprint, id: string): Edge[] {
  return plan.edges.filter((edge) => edge.start === id || edge.end === id);
}

function cross(a: Point, b: Point, c: Point) {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

function onSegment(point: Point, a: Point, b: Point) {
  return (
    Math.abs(cross(a, b, point)) < epsilon &&
    point.x >= Math.min(a.x, b.x) - epsilon &&
    point.x <= Math.max(a.x, b.x) + epsilon &&
    point.y >= Math.min(a.y, b.y) - epsilon &&
    point.y <= Math.max(a.y, b.y) + epsilon
  );
}

function intersects(a: Point, b: Point, c: Point, d: Point) {
  return (
    (cross(a, b, c) * cross(a, b, d) < -epsilon &&
      cross(c, d, a) * cross(c, d, b) < -epsilon) ||
    onSegment(a, c, d) ||
    onSegment(b, c, d) ||
    onSegment(c, a, b) ||
    onSegment(d, a, b)
  );
}

/** Validates graph integrity and the supplied topology policy; open graphs are allowed. */
export function validateBlueprint(
  plan: Blueprint,
  constraints: BlueprintConstraints = defaultConstraints,
): BlueprintError | null {
  if (
    plan.vertices.length > constraints.maxVertices ||
    plan.edges.length > constraints.maxEdges
  )
    return "limit";
  const ids = new Set(plan.vertices.map((vertex) => vertex.id));
  if (
    ids.size !== plan.vertices.length ||
    new Set(plan.edges.map((edge) => edge.id)).size !== plan.edges.length
  )
    return "connections";
  if (
    plan.vertices.some(
      (vertex) =>
        !Number.isFinite(vertex.x) ||
        !Number.isFinite(vertex.y) ||
        Math.abs(vertex.x) > constraints.coordinateLimit ||
        Math.abs(vertex.y) > constraints.coordinateLimit,
    )
  )
    return "coordinates";
  for (let i = 0; i < plan.vertices.length; i++) {
    const vertex = plan.vertices[i];
    if (connectedEdges(plan, vertex.id).length > constraints.maxDegree)
      return "connections";
    if (
      plan.vertices
        .slice(i + 1)
        .some(
          (other) =>
            Math.hypot(vertex.x - other.x, vertex.y - other.y) <
            constraints.minDistance - epsilon,
        )
    )
      return "shortEdge";
  }
  for (const edge of plan.edges) {
    if (!ids.has(edge.start) || !ids.has(edge.end) || edge.start === edge.end)
      return "connections";
    if (edgeLength(plan, edge) < constraints.minDistance - epsilon)
      return "shortEdge";
  }
  for (let i = 0; i < plan.edges.length; i++) {
    const edge = plan.edges[i];
    const a = plan.vertices.find((vertex) => vertex.id === edge.start)!;
    const b = plan.vertices.find((vertex) => vertex.id === edge.end)!;
    if (
      !constraints.allowIntersections &&
      plan.vertices.some(
        (vertex) =>
          vertex.id !== a.id && vertex.id !== b.id && onSegment(vertex, a, b),
      )
    )
      return "intersection";
    for (const other of plan.edges.slice(i + 1)) {
      const shared = [edge.start, edge.end].filter(
        (id) => id === other.start || id === other.end,
      );
      if (shared.length === 2) return "connections";
      if (shared.length === 1) continue;
      const c = plan.vertices.find((vertex) => vertex.id === other.start)!;
      const d = plan.vertices.find((vertex) => vertex.id === other.end)!;
      if (!constraints.allowIntersections && intersects(a, b, c, d))
        return "intersection";
    }
  }
  return null;
}

/** Returns a single closed outline in positive winding order, or null for an open draft. */
export function closedOutline(plan: Blueprint): Vertex[] | null {
  if (
    plan.vertices.length < 3 ||
    plan.edges.length !== plan.vertices.length ||
    validateBlueprint(plan, {
      ...defaultConstraints,
      maxVertices: plan.vertices.length,
      maxEdges: plan.edges.length,
      coordinateLimit: Number.MAX_VALUE,
      minDistance: epsilon,
      maxDegree: 2,
      allowIntersections: false,
    })
  )
    return null;
  const ordered: Vertex[] = [];
  let current = plan.vertices[0];
  let previous: string | null = null;
  while (!ordered.some((vertex) => vertex.id === current.id)) {
    ordered.push(current);
    const edges = connectedEdges(plan, current.id);
    if (edges.length !== 2) return null;
    const nextEdge = edges.find(
      (edge) =>
        (edge.start === current.id ? edge.end : edge.start) !== previous,
    );
    if (!nextEdge) return null;
    const nextId =
      nextEdge.start === current.id ? nextEdge.end : nextEdge.start;
    previous = current.id;
    current = plan.vertices.find((vertex) => vertex.id === nextId)!;
  }
  if (
    current.id !== ordered[0].id ||
    ordered.length !== plan.vertices.length ||
    Math.abs(signedArea(ordered)) < epsilon
  )
    return null;
  return signedArea(ordered) > 0 ? ordered : ordered.reverse();
}

function signedArea(points: Point[]) {
  return (
    points.reduce((sum, point, index) => {
      const next = points[(index + 1) % points.length];
      return sum + point.x * next.y - next.x * point.y;
    }, 0) / 2
  );
}

/** Returns enclosed area in square metres only for a closed outline. */
export function outlineArea(plan: Blueprint): number | null {
  const outline = closedOutline(plan);
  return outline ? Math.abs(signedArea(outline)) : null;
}

/** Moves one vertex without mutating its neighbours or edge identities. */
export function moveVertex(
  plan: Blueprint,
  id: string,
  point: Point,
): Blueprint {
  return {
    ...plan,
    vertices: plan.vertices.map((vertex) =>
      vertex.id === id ? { ...vertex, ...point } : vertex,
    ),
  };
}

/** Adds an intermediate vertex to an edge, preserving its two connected neighbours. */
export function splitEdge(
  plan: Blueprint,
  edgeId: string,
  vertexId: string,
  newEdgeId: string,
): Blueprint {
  const edge = plan.edges.find((edge) => edge.id === edgeId);
  if (!edge) return plan;
  const a = plan.vertices.find((vertex) => vertex.id === edge.start)!;
  const b = plan.vertices.find((vertex) => vertex.id === edge.end)!;
  return {
    vertices: [
      ...plan.vertices,
      { id: vertexId, x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
    ],
    edges: [
      ...plan.edges.map((entry) =>
        entry.id === edgeId ? { ...entry, end: vertexId } : entry,
      ),
      { id: newEdgeId, start: vertexId, end: edge.end },
    ],
  };
}

/** Tests a point against a concave outline, counting its boundary as inside. */
export function pointInside(point: Point, outline: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = outline.length - 1; i < outline.length; j = i++) {
    const a = outline[i],
      b = outline[j];
    if (onSegment(point, a, b)) return true;
    if (
      a.y > point.y !== b.y > point.y &&
      point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x
    )
      inside = !inside;
  }
  return inside;
}

/** Checks a polygon footprint including edge segments across concave recesses. */
export function footprintInside(footprint: Point[], outline: Point[]): boolean {
  if (!footprint.every((point) => pointInside(point, outline))) return false;
  for (let i = 0; i < footprint.length; i++) {
    const a = footprint[i],
      b = footprint[(i + 1) % footprint.length];
    const cuts = [0, 1];
    for (let j = 0; j < outline.length; j++) {
      const c = outline[j],
        d = outline[(j + 1) % outline.length];
      const denominator = (b.x - a.x) * (d.y - c.y) - (b.y - a.y) * (d.x - c.x);
      if (Math.abs(denominator) < epsilon) continue;
      const t =
        ((c.x - a.x) * (d.y - c.y) - (c.y - a.y) * (d.x - c.x)) / denominator;
      const u =
        ((c.x - a.x) * (b.y - a.y) - (c.y - a.y) * (b.x - a.x)) / denominator;
      if (t > 0 && t < 1 && u >= 0 && u <= 1) cuts.push(t);
    }
    cuts.sort((a, b) => a - b);
    for (let j = 1; j < cuts.length; j++) {
      const t = (cuts[j - 1] + cuts[j]) / 2;
      if (
        !pointInside(
          { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t },
          outline,
        )
      )
        return false;
    }
  }
  return true;
}

/** Validates a versioned document's vertex/edge graph before using its geometry. */
export function parseBlueprint(
  value: unknown,
  constraints: BlueprintConstraints = defaultConstraints,
): Blueprint {
  if (!value || typeof value !== "object") throw new Error("Invalid blueprint");
  const input = value as Record<string, unknown>;
  if (
    !Array.isArray(input.vertices) ||
    !Array.isArray(input.edges) ||
    input.vertices.length > constraints.maxVertices ||
    input.edges.length > constraints.maxEdges
  )
    throw new Error("Invalid blueprint");
  const validId = (id: unknown): id is string =>
    typeof id === "string" && id.length > 0 && id.length <= 100;
  const vertices = input.vertices.map((vertex) => {
    if (
      !vertex ||
      !validId(vertex.id) ||
      typeof vertex.x !== "number" ||
      typeof vertex.y !== "number"
    )
      throw new Error("Invalid vertex");
    return { id: vertex.id, x: vertex.x, y: vertex.y };
  });
  const edges = input.edges.map((edge) => {
    if (
      !edge ||
      !validId(edge.id) ||
      !validId(edge.start) ||
      !validId(edge.end)
    )
      throw new Error("Invalid edge");
    return { id: edge.id, start: edge.start, end: edge.end };
  });
  const plan = { vertices, edges };
  if (validateBlueprint(plan, constraints))
    throw new Error("Invalid blueprint geometry");
  return plan;
}
