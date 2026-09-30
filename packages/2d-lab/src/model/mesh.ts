export type Point = { x: number; y: number };
export type Vertex = Point & { id: string };
export type Edge = { id: string; start: string; end: string };
/** Ordered boundary vertices; adjacent pairs must be connected by mesh edges. */
export type Face = { id: string; vertices: string[] };
/** Serializable 2D topology. Omitted faces support older graph-only documents. */
export type Mesh2D = { vertices: Vertex[]; edges: Edge[]; faces?: Face[] };
export type MeshSelection = {
  kind: "vertex" | "edge" | "face";
  id: string;
} | null;
export type MeshError =
  | "limit"
  | "coordinates"
  | "shortEdge"
  | "intersection"
  | "connections"
  | "faces";
/** Validation policy supplied by the consuming product; values use stored metres. */
export type MeshConstraints = {
  maxVertices: number;
  maxEdges: number;
  coordinateLimit: number;
  minDistance: number;
  maxDegree: number;
  allowIntersections: boolean;
  maxFaces?: number;
  /** Permit collapsed, overlapping and self-crossing faces while retaining valid references. */
  allowDegenerateFaces?: boolean;
};
/** General drawing policy: supports open, disconnected and branching graphs. */
export const defaultConstraints: MeshConstraints = {
  maxFaces: 256,
  maxVertices: 256,
  maxEdges: 512,
  coordinateLimit: 1000,
  minDistance: 0.001,
  maxDegree: 256,
  allowIntersections: true,
};

/** Unrestricted editing geometry; hosts can supply stricter policies for domain-specific tools. */
export const freeDrawingConstraints: MeshConstraints = {
  maxFaces: Number.POSITIVE_INFINITY,
  maxVertices: Number.POSITIVE_INFINITY,
  maxEdges: Number.POSITIVE_INFINITY,
  coordinateLimit: Number.POSITIVE_INFINITY,
  minDistance: 0,
  maxDegree: Number.POSITIVE_INFINITY,
  allowIntersections: true,
  allowDegenerateFaces: true,
};

const epsilon = 1e-7;

/** Creates the four connected vertices of a centred rectangle. */
export function rectangleMesh(width: number, height: number): Mesh2D {
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
export function meshBounds(plan: Mesh2D) {
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
export function edgeLength(plan: Mesh2D, edge: Edge): number {
  const start = plan.vertices.find((vertex) => vertex.id === edge.start);
  const end = plan.vertices.find((vertex) => vertex.id === edge.end);
  return start && end ? Math.hypot(end.x - start.x, end.y - start.y) : 0;
}

/** Lists the edges incident to a vertex without assuming array order. */
export function connectedEdges(plan: Mesh2D, id: string): Edge[] {
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

/** Validates graph references and the host policy. Use freeDrawingConstraints to allow overlapping points and degenerate faces without geometric limits. */
export function validateMesh(
  plan: Mesh2D,
  constraints: MeshConstraints = defaultConstraints,
): MeshError | null {
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
  const vertices = new Map(plan.vertices.map((vertex) => [vertex.id, vertex]));
  const degrees = new Map<string, number>();
  const pairs = new Set<string>();
  for (const edge of plan.edges) {
    if (!ids.has(edge.start) || !ids.has(edge.end) || edge.start === edge.end)
      return "connections";
    const pair = edgePair(edge.start, edge.end);
    if (pairs.has(pair)) return "connections";
    pairs.add(pair);
    for (const id of [edge.start, edge.end]) {
      const degree = (degrees.get(id) ?? 0) + 1;
      if (degree > constraints.maxDegree) return "connections";
      degrees.set(id, degree);
    }
  }
  if (constraints.minDistance > 0) {
    for (let i = 0; i < plan.vertices.length; i++) {
      const vertex = plan.vertices[i];
      for (let j = i + 1; j < plan.vertices.length; j++) {
        const other = plan.vertices[j];
        if (
          Math.hypot(vertex.x - other.x, vertex.y - other.y) <
          constraints.minDistance - epsilon
        )
          return "shortEdge";
      }
    }
  }
  if (!constraints.allowIntersections) {
    for (let i = 0; i < plan.edges.length; i++) {
      const edge = plan.edges[i];
      const a = vertices.get(edge.start)!;
      const b = vertices.get(edge.end)!;
      if (
        plan.vertices.some(
          (vertex) =>
            vertex.id !== a.id && vertex.id !== b.id && onSegment(vertex, a, b),
        )
      )
        return "intersection";
      for (let j = i + 1; j < plan.edges.length; j++) {
        const other = plan.edges[j];
        if (
          [edge.start, edge.end].some(
            (id) => id === other.start || id === other.end,
          )
        )
          continue;
        if (
          intersects(a, b, vertices.get(other.start)!, vertices.get(other.end)!)
        )
          return "intersection";
      }
    }
  }
  return validateFaces(
    plan,
    constraints.maxFaces ?? 256,
    constraints.allowDegenerateFaces ?? false,
  );
}

/** Returns a single closed outline in positive winding order, or null for an open draft. */
export function closedOutline(plan: Mesh2D): Vertex[] | null {
  if (
    plan.vertices.length < 3 ||
    plan.edges.length !== plan.vertices.length ||
    validateMesh(
      { ...plan, faces: [] },
      {
        ...defaultConstraints,
        maxVertices: plan.vertices.length,
        maxEdges: plan.edges.length,
        coordinateLimit: Number.MAX_VALUE,
        minDistance: epsilon,
        maxDegree: 2,
        allowIntersections: false,
      },
    )
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
export function outlineArea(plan: Mesh2D): number | null {
  const outline = closedOutline(plan);
  return outline ? Math.abs(signedArea(outline)) : null;
}

/** Moves one vertex without mutating its neighbours or edge identities. */
export function moveVertex(plan: Mesh2D, id: string, point: Point): Mesh2D {
  return {
    ...plan,
    vertices: plan.vertices.map((vertex) =>
      vertex.id === id ? { ...vertex, ...point } : vertex,
    ),
  };
}

/** Adds an intermediate vertex to an edge, preserving its two connected neighbours. */
export function splitEdge(
  plan: Mesh2D,
  edgeId: string,
  vertexId: string,
  newEdgeId: string,
): Mesh2D {
  const edge = plan.edges.find((edge) => edge.id === edgeId);
  if (!edge) return plan;
  const a = plan.vertices.find((vertex) => vertex.id === edge.start)!;
  const b = plan.vertices.find((vertex) => vertex.id === edge.end)!;
  return {
    ...plan,
    ...(plan.faces
      ? {
          faces: plan.faces.map((face) => ({
            ...face,
            vertices: face.vertices.flatMap((id, index) => {
              const next = face.vertices[(index + 1) % face.vertices.length];
              return (id === edge.start && next === edge.end) ||
                (id === edge.end && next === edge.start)
                ? [id, vertexId]
                : [id];
            }),
          })),
        }
      : {}),
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
export function parseMesh(
  value: unknown,
  constraints: MeshConstraints = defaultConstraints,
): Mesh2D {
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
  const faces =
    input.faces === undefined
      ? undefined
      : parseFaces(
          input.faces,
          constraints.maxFaces ?? 256,
          constraints.maxVertices,
        );
  const plan: Mesh2D = { vertices, edges, ...(faces ? { faces } : {}) };
  if (validateMesh(plan, constraints))
    throw new Error("Invalid blueprint geometry");
  return plan;
}

function parseFaces(
  value: unknown,
  limit: number,
  vertexLimit: number,
): Face[] {
  if (!Array.isArray(value) || value.length > limit)
    throw new Error("Invalid faces");
  return value.map((raw: unknown) => {
    if (!raw || typeof raw !== "object") throw new Error("Invalid face");
    const f = raw as Record<string, unknown>;
    if (
      typeof f.id !== "string" ||
      !f.id.length ||
      f.id.length > 100 ||
      !Array.isArray(f.vertices) ||
      f.vertices.length > vertexLimit ||
      f.vertices.some(
        (id) => typeof id !== "string" || !id.length || id.length > 100,
      )
    )
      throw new Error("Invalid face");
    return { id: f.id, vertices: [...f.vertices] as string[] };
  });
}
function faceHasEdge(face: Face, start: string, end: string): boolean {
  return face.vertices.some((id, index) => {
    const next = face.vertices[(index + 1) % face.vertices.length];
    return (id === start && next === end) || (id === end && next === start);
  });
}
function edgePair(a: string, b: string): string {
  return JSON.stringify(a < b ? [a, b] : [b, a]);
}
function validateFaces(
  mesh: Mesh2D,
  limit: number,
  allowDegenerate: boolean,
): MeshError | null {
  const faces = mesh.faces ?? [];
  if (faces.length > limit) return "limit";
  const ids = new Set<string>();
  const rings = new Set<string>();
  const vertices = new Map(mesh.vertices.map((v) => [v.id, v]));
  const edges = new Set(mesh.edges.map((e) => edgePair(e.start, e.end)));
  for (const face of faces) {
    const signature = [...face.vertices].sort().join("\0");
    if (
      !face.id ||
      ids.has(face.id) ||
      rings.has(signature) ||
      face.vertices.length < 3 ||
      new Set(face.vertices).size !== face.vertices.length
    )
      return "faces";
    ids.add(face.id);
    rings.add(signature);
    const points = face.vertices.map((id) => vertices.get(id));
    if (points.some((p) => !p)) return "faces";
    const polygon = points as Vertex[];
    if (!allowDegenerate && Math.abs(signedArea(polygon)) < epsilon)
      return "faces";
    for (let i = 0; i < polygon.length; i++) {
      const a = polygon[i],
        b = polygon[(i + 1) % polygon.length];
      if (!edges.has(edgePair(a.id, b.id))) return "faces";
      if (allowDegenerate) continue;
      for (let j = 0; j < polygon.length; j++)
        if (
          j !== i &&
          j !== (i + 1) % polygon.length &&
          onSegment(polygon[j], a, b)
        )
          return "faces";
      for (let j = i + 1; j < polygon.length; j++) {
        if (j === (i + 1) % polygon.length || (j + 1) % polygon.length === i)
          continue;
        if (intersects(a, b, polygon[j], polygon[(j + 1) % polygon.length]))
          return "faces";
      }
    }
  }
  return null;
}
/** Returns referenced vertices exactly once for a point, edge or face selection. */
export function selectionVertices(
  mesh: Mesh2D,
  selection: MeshSelection,
): string[] {
  if (!selection) return [];
  if (selection.kind === "vertex")
    return mesh.vertices.some((v) => v.id === selection.id)
      ? [selection.id]
      : [];
  if (selection.kind === "edge") {
    const edge = mesh.edges.find((e) => e.id === selection.id);
    return edge ? [edge.start, edge.end] : [];
  }
  return [
    ...new Set(mesh.faces?.find((f) => f.id === selection.id)?.vertices ?? []),
  ];
}
/** Translates selected topology once per shared vertex; adjacent edges and faces follow automatically. */
export function translateSelection(
  mesh: Mesh2D,
  selection: MeshSelection,
  delta: Point,
): Mesh2D {
  const ids = new Set(selectionVertices(mesh, selection));
  return {
    ...mesh,
    vertices: mesh.vertices.map((v) =>
      ids.has(v.id)
        ? {
            ...v,
            x: Number((v.x + delta.x).toFixed(6)),
            y: Number((v.y + delta.y).toFixed(6)),
          }
        : v,
    ),
  };
}
/** Returns the mean vertex position for exact movement of the current selection. */
export function selectionCenter(mesh: Mesh2D, selection: MeshSelection): Point {
  const ids = new Set(selectionVertices(mesh, selection));
  const vertices = mesh.vertices.filter((v) => ids.has(v.id));
  return vertices.length
    ? {
        x: vertices.reduce((sum, v) => sum + v.x, 0) / vertices.length,
        y: vertices.reduce((sum, v) => sum + v.y, 0) / vertices.length,
      }
    : { x: 0, y: 0 };
}
/** Measures a face in square metres; the caller supplies validated topology. */
export function faceArea(mesh: Mesh2D, face: Face): number {
  return Math.abs(
    signedArea(
      face.vertices.map((id) => mesh.vertices.find((v) => v.id === id)!),
    ),
  );
}
/** Adds a face from an ordered vertex ring, reusing shared edges and creating missing boundary edges. Validate before committing. */
export function createFace(
  mesh: Mesh2D,
  vertices: string[],
  id: string,
): Mesh2D {
  const edges = [...mesh.edges];
  vertices.forEach((start, index) => {
    const end = vertices[(index + 1) % vertices.length];
    if (
      !edges.some(
        (e) =>
          (e.start === start && e.end === end) ||
          (e.start === end && e.end === start),
      )
    )
      edges.push({ id: `${id}-edge-${index}`, start, end });
  });
  return {
    ...mesh,
    edges,
    faces: [...(mesh.faces ?? []), { id, vertices: [...vertices] }],
  };
}
/** Removes selected topology; deleting an edge/vertex removes dependent faces, while deleting a face keeps its boundary. */
export function deleteSelection(
  mesh: Mesh2D,
  selection: MeshSelection,
): Mesh2D {
  if (!selection) return mesh;
  if (selection.kind === "face")
    return {
      ...mesh,
      faces: (mesh.faces ?? []).filter((f) => f.id !== selection.id),
    };
  const edge = mesh.edges.find((e) => e.id === selection.id);
  return {
    ...mesh,
    vertices:
      selection.kind === "vertex"
        ? mesh.vertices.filter((v) => v.id !== selection.id)
        : mesh.vertices,
    edges: mesh.edges.filter((e) =>
      selection.kind === "vertex"
        ? e.start !== selection.id && e.end !== selection.id
        : e.id !== selection.id,
    ),
    ...(mesh.faces
      ? {
          faces: mesh.faces.filter((f) =>
            selection.kind === "vertex"
              ? !f.vertices.includes(selection.id)
              : !edge || !faceHasEdge(f, edge.start, edge.end),
          ),
        }
      : {}),
  };
}
