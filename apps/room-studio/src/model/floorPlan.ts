export type Point = { x: number; z: number };
export type Corner = Point & { id: string };
export type Wall = { id: string; start: string; end: string };
export type FloorPlan = { corners: Corner[]; walls: Wall[] };
export type PlanSelection = { kind: "corner" | "wall"; id: string } | null;
export type PlanError =
  "limit" | "coordinates" | "shortWall" | "intersection" | "connections";
const epsilon = 1e-7;

/** Creates the four connected corners of a centred rectangular room. */
export function rectanglePlan(width: number, depth: number): FloorPlan {
  const corners = [
    { id: "corner-1", x: -width / 2, z: -depth / 2 },
    { id: "corner-2", x: width / 2, z: -depth / 2 },
    { id: "corner-3", x: width / 2, z: depth / 2 },
    { id: "corner-4", x: -width / 2, z: depth / 2 },
  ];
  return {
    corners,
    walls: corners.map((corner, index) => ({
      id: `wall-${index + 1}`,
      start: corner.id,
      end: corners[(index + 1) % 4].id,
    })),
  };
}

/** Returns the drawing envelope, including off-centre and unfinished plans. */
export function planBounds(plan: FloorPlan) {
  if (!plan.corners.length)
    return {
      minX: -2.5,
      maxX: 2.5,
      minZ: -2,
      maxZ: 2,
      width: 5,
      depth: 4,
      centerX: 0,
      centerZ: 0,
    };
  const minX = Math.min(...plan.corners.map((corner) => corner.x));
  const maxX = Math.max(...plan.corners.map((corner) => corner.x));
  const minZ = Math.min(...plan.corners.map((corner) => corner.z));
  const maxZ = Math.max(...plan.corners.map((corner) => corner.z));
  return {
    minX,
    maxX,
    minZ,
    maxZ,
    width: Math.max(0.05, maxX - minX),
    depth: Math.max(0.05, maxZ - minZ),
    centerX: (minX + maxX) / 2,
    centerZ: (minZ + maxZ) / 2,
  };
}

/** Measures a wall in metres. */
export function wallLength(plan: FloorPlan, wall: Wall): number {
  const start = plan.corners.find((corner) => corner.id === wall.start);
  const end = plan.corners.find((corner) => corner.id === wall.end);
  return start && end ? Math.hypot(end.x - start.x, end.z - start.z) : 0;
}

/** Lists the walls incident to a corner without assuming array order. */
export function connectedWalls(plan: FloorPlan, id: string): Wall[] {
  return plan.walls.filter((wall) => wall.start === id || wall.end === id);
}

function cross(a: Point, b: Point, c: Point) {
  return (b.x - a.x) * (c.z - a.z) - (b.z - a.z) * (c.x - a.x);
}

function onSegment(point: Point, a: Point, b: Point) {
  return (
    Math.abs(cross(a, b, point)) < epsilon &&
    point.x >= Math.min(a.x, b.x) - epsilon &&
    point.x <= Math.max(a.x, b.x) + epsilon &&
    point.z >= Math.min(a.z, b.z) - epsilon &&
    point.z <= Math.max(a.z, b.z) + epsilon
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

/** Rejects crossing/overlapping walls and invalid graph connections; open drafts are allowed. */
export function validatePlan(plan: FloorPlan): PlanError | null {
  if (plan.corners.length > 64 || plan.walls.length > 64) return "limit";
  const ids = new Set(plan.corners.map((corner) => corner.id));
  if (
    ids.size !== plan.corners.length ||
    new Set(plan.walls.map((wall) => wall.id)).size !== plan.walls.length
  )
    return "connections";
  if (
    plan.corners.some(
      (corner) =>
        !Number.isFinite(corner.x) ||
        !Number.isFinite(corner.z) ||
        Math.abs(corner.x) > 10 ||
        Math.abs(corner.z) > 10,
    )
  )
    return "coordinates";
  for (let i = 0; i < plan.corners.length; i++) {
    const corner = plan.corners[i];
    if (connectedWalls(plan, corner.id).length > 2) return "connections";
    if (
      plan.corners
        .slice(i + 1)
        .some(
          (other) =>
            Math.hypot(corner.x - other.x, corner.z - other.z) < 0.05 - epsilon,
        )
    )
      return "shortWall";
  }
  for (const wall of plan.walls) {
    if (!ids.has(wall.start) || !ids.has(wall.end) || wall.start === wall.end)
      return "connections";
    if (wallLength(plan, wall) < 0.05 - epsilon) return "shortWall";
  }
  for (let i = 0; i < plan.walls.length; i++) {
    const wall = plan.walls[i];
    const a = plan.corners.find((corner) => corner.id === wall.start)!;
    const b = plan.corners.find((corner) => corner.id === wall.end)!;
    if (
      plan.corners.some(
        (corner) =>
          corner.id !== a.id && corner.id !== b.id && onSegment(corner, a, b),
      )
    )
      return "intersection";
    for (const other of plan.walls.slice(i + 1)) {
      const shared = [wall.start, wall.end].filter(
        (id) => id === other.start || id === other.end,
      );
      if (shared.length === 2) return "connections";
      if (shared.length === 1) continue;
      const c = plan.corners.find((corner) => corner.id === other.start)!;
      const d = plan.corners.find((corner) => corner.id === other.end)!;
      if (intersects(a, b, c, d)) return "intersection";
    }
  }
  return null;
}

/** Returns a single closed outline in positive winding order, or null for an open draft. */
export function closedOutline(plan: FloorPlan): Corner[] | null {
  if (
    plan.corners.length < 3 ||
    plan.walls.length !== plan.corners.length ||
    validatePlan(plan)
  )
    return null;
  const ordered: Corner[] = [];
  let current = plan.corners[0];
  let previous: string | null = null;
  while (!ordered.some((corner) => corner.id === current.id)) {
    ordered.push(current);
    const edges = connectedWalls(plan, current.id);
    if (edges.length !== 2) return null;
    const nextWall = edges.find(
      (wall) =>
        (wall.start === current.id ? wall.end : wall.start) !== previous,
    );
    if (!nextWall) return null;
    const nextId =
      nextWall.start === current.id ? nextWall.end : nextWall.start;
    previous = current.id;
    current = plan.corners.find((corner) => corner.id === nextId)!;
  }
  if (
    current.id !== ordered[0].id ||
    ordered.length !== plan.corners.length ||
    Math.abs(signedArea(ordered)) < 0.01
  )
    return null;
  return signedArea(ordered) > 0 ? ordered : ordered.reverse();
}

function signedArea(points: Point[]) {
  return (
    points.reduce((sum, point, index) => {
      const next = points[(index + 1) % points.length];
      return sum + point.x * next.z - next.x * point.z;
    }, 0) / 2
  );
}

/** Returns usable floor area in square metres only for a closed outline. */
export function floorArea(plan: FloorPlan): number | null {
  const outline = closedOutline(plan);
  return outline ? Math.abs(signedArea(outline)) : null;
}

/** Moves one corner without mutating its neighbours or wall identities. */
export function moveCorner(
  plan: FloorPlan,
  id: string,
  point: Point,
): FloorPlan {
  return {
    ...plan,
    corners: plan.corners.map((corner) =>
      corner.id === id ? { ...corner, ...point } : corner,
    ),
  };
}

/** Adds an intermediate corner to a wall, preserving its two connected neighbours. */
export function splitWall(
  plan: FloorPlan,
  wallId: string,
  cornerId: string,
  newWallId: string,
): FloorPlan {
  const wall = plan.walls.find((wall) => wall.id === wallId);
  if (!wall) return plan;
  const a = plan.corners.find((corner) => corner.id === wall.start)!;
  const b = plan.corners.find((corner) => corner.id === wall.end)!;
  return {
    corners: [
      ...plan.corners,
      { id: cornerId, x: (a.x + b.x) / 2, z: (a.z + b.z) / 2 },
    ],
    walls: [
      ...plan.walls.map((entry) =>
        entry.id === wallId ? { ...entry, end: cornerId } : entry,
      ),
      { id: newWallId, start: cornerId, end: wall.end },
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
      a.z > point.z !== b.z > point.z &&
      point.x < ((b.x - a.x) * (point.z - a.z)) / (b.z - a.z) + a.x
    )
      inside = !inside;
  }
  return inside;
}

/** Checks a furniture footprint including edge segments across concave recesses. */
export function footprintInside(footprint: Point[], outline: Point[]): boolean {
  if (!footprint.every((point) => pointInside(point, outline))) return false;
  for (let i = 0; i < footprint.length; i++) {
    const a = footprint[i],
      b = footprint[(i + 1) % footprint.length];
    const cuts = [0, 1];
    for (let j = 0; j < outline.length; j++) {
      const c = outline[j],
        d = outline[(j + 1) % outline.length];
      const denominator = (b.x - a.x) * (d.z - c.z) - (b.z - a.z) * (d.x - c.x);
      if (Math.abs(denominator) < epsilon) continue;
      const t =
        ((c.x - a.x) * (d.z - c.z) - (c.z - a.z) * (d.x - c.x)) / denominator;
      const u =
        ((c.x - a.x) * (b.z - a.z) - (c.z - a.z) * (b.x - a.x)) / denominator;
      if (t > 0 && t < 1 && u >= 0 && u <= 1) cuts.push(t);
    }
    cuts.sort((a, b) => a - b);
    for (let j = 1; j < cuts.length; j++) {
      const t = (cuts[j - 1] + cuts[j]) / 2;
      if (
        !pointInside(
          { x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t },
          outline,
        )
      )
        return false;
    }
  }
  return true;
}

/** Validates a versioned document's corner/edge graph before using its geometry. */
export function parseFloorPlan(value: unknown): FloorPlan {
  if (!value || typeof value !== "object")
    throw new Error("Invalid floor plan");
  const input = value as Record<string, unknown>;
  if (
    !Array.isArray(input.corners) ||
    !Array.isArray(input.walls) ||
    input.corners.length > 64 ||
    input.walls.length > 64
  )
    throw new Error("Invalid floor plan");
  const validId = (id: unknown): id is string =>
    typeof id === "string" && id.length > 0 && id.length <= 100;
  const corners = input.corners.map((corner) => {
    if (
      !corner ||
      !validId(corner.id) ||
      typeof corner.x !== "number" ||
      typeof corner.z !== "number"
    )
      throw new Error("Invalid corner");
    return { id: corner.id, x: corner.x, z: corner.z };
  });
  const walls = input.walls.map((wall) => {
    if (
      !wall ||
      !validId(wall.id) ||
      !validId(wall.start) ||
      !validId(wall.end)
    )
      throw new Error("Invalid wall");
    return { id: wall.id, start: wall.start, end: wall.end };
  });
  const plan = { corners, walls };
  if (validatePlan(plan)) throw new Error("Invalid floor plan geometry");
  return plan;
}
