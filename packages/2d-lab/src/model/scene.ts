import {
  freeDrawingConstraints,
  meshBounds,
  parseMesh,
  rectangleMesh,
  createFace,
  type Mesh2D,
  type MeshConstraints,
  type Point,
  type MeshSelection,
  translateSelection,
  selectionVertices,
} from "./mesh";

/** One selected object (null target) or topology element identified inside its owning mesh. */
export type SceneSelection = { objectId: string; target: MeshSelection };

/** Translates a selection atomically, moving shared vertices only once even for adjacent faces/edges. */
export function moveSceneSelections(
  scene: Scene2D,
  selections: readonly SceneSelection[],
  delta: Point,
  policy = defaultEnginePolicy,
): Scene2D {
  if (!Number.isFinite(delta.x) || !Number.isFinite(delta.y))
    throw new Error("Invalid movement");
  const objects = parseScene(scene, policy).objects.map((object) => {
    const targets = selections.filter((item) => item.objectId === object.id);
    const ids = new Set(
      targets.flatMap((item) =>
        item.target
          ? selectionVertices(object.mesh, item.target)
          : object.mesh.vertices.map((v) => v.id),
      ),
    );
    const whole = targets.some((item) => item.target === null);
    if (!ids.size && !whole) return object;
    return {
      ...object,
      origin: whole
        ? {
            x: objectOrigin(object).x + delta.x,
            y: objectOrigin(object).y + delta.y,
          }
        : objectOrigin(object),
      mesh: {
        ...object.mesh,
        vertices: object.mesh.vertices.map((v) =>
          ids.has(v.id)
            ? {
                ...v,
                x: Math.round((v.x + delta.x) * 1e6) / 1e6,
                y: Math.round((v.y + delta.y) * 1e6) / 1e6,
              }
            : v,
        ),
      },
    };
  });
  return parseScene({ ...scene, objects }, policy);
}

/** Moves an object or one of its topology elements, resolving IDs inside the owning object only. */
export function moveSceneSelection(
  scene: Scene2D,
  objectId: string,
  selection: MeshSelection,
  delta: Point,
  policy = defaultEnginePolicy,
): Scene2D {
  if (!selection) return moveObject(scene, objectId, delta, policy);
  const object = scene.objects.find((object) => object.id === objectId);
  if (!object) throw new Error("Unknown object");
  return replaceObjectMesh(
    scene,
    objectId,
    translateSelection(object.mesh, selection, delta),
    policy,
  );
}

/** Independent mesh with a stable identity and display name. Coordinates are in scene metres. */
export type SceneObject = {
  id: string;
  name: string;
  mesh: Mesh2D;
  /** Optional only for legacy inputs; parsed scenes always contain an origin. */
  origin?: Point;
};

/** Stable object position and pivot; legacy documents use their initial bounding-box center. */
export function objectOrigin(object: SceneObject): Point {
  if (object.origin) return object.origin;
  const bounds = meshBounds(object.mesh);
  return { x: bounds.centerX, y: bounds.centerY };
}
/** Versioned, JSON-serializable scene; object-local vertex IDs may repeat across objects. */
export type Scene2D = { version: 1; objects: SceneObject[] };
export type SelectionMode = "object" | "vertex" | "edge" | "face";
/** Host policy for scene limits, available tools and mesh validation. */
export type EnginePolicy = {
  maxObjects: number;
  mesh: MeshConstraints;
  modes: readonly SelectionMode[];
  createObjects: boolean;
  createFaces: boolean;
};
/** Free editing without geometry or object-count limits; hosts opt into stricter policies. */
export const defaultEnginePolicy: EnginePolicy = {
  maxObjects: Number.POSITIVE_INFINITY,
  mesh: freeDrawingConstraints,
  modes: ["object", "vertex", "edge", "face"],
  createObjects: true,
  createFaces: true,
};

/** Validates untrusted scene data and strips unknown properties; throws without changing input. */
export function parseScene(
  value: unknown,
  policy: EnginePolicy = defaultEnginePolicy,
): Scene2D {
  if (!value || typeof value !== "object") throw new Error("Invalid scene");
  const input = value as Record<string, unknown>;
  if (
    input.version !== 1 ||
    !Array.isArray(input.objects) ||
    input.objects.length > policy.maxObjects
  )
    throw new Error("Invalid scene version or object count");
  const ids = new Set<string>();
  const objects = input.objects.map((item: unknown): SceneObject => {
    if (!item || typeof item !== "object") throw new Error("Invalid object");
    const object = item as Record<string, unknown>;
    if (
      typeof object.id !== "string" ||
      !/^[\w-]{1,100}$/.test(object.id) ||
      ids.has(object.id) ||
      typeof object.name !== "string" ||
      !object.name.trim() ||
      object.name.length > 100
    )
      throw new Error("Invalid object identity");
    ids.add(object.id);
    const mesh = parseMesh(object.mesh, policy.mesh);
    const origin =
      object.origin === undefined
        ? objectOrigin({ id: object.id, name: object.name, mesh })
        : (object.origin as Point);
    if (
      !origin ||
      typeof origin !== "object" ||
      !Number.isFinite(origin.x) ||
      !Number.isFinite(origin.y) ||
      Math.abs(origin.x) > policy.mesh.coordinateLimit ||
      Math.abs(origin.y) > policy.mesh.coordinateLimit
    )
      throw new Error("Invalid origin");
    return {
      id: object.id,
      name: object.name.trim(),
      mesh,
      origin: { x: origin.x, y: origin.y },
    };
  });
  return { version: 1, objects };
}

/** Applies an immutable mesh replacement and validates the entire scene using host constraints. */
export function replaceObjectMesh(
  scene: Scene2D,
  id: string,
  mesh: Mesh2D,
  policy = defaultEnginePolicy,
): Scene2D {
  if (!scene.objects.some((object) => object.id === id))
    throw new Error("Unknown object");
  return parseScene(
    {
      ...scene,
      objects: parseScene(scene, policy).objects.map((object) =>
        object.id === id ? { ...object, mesh } : object,
      ),
    },
    policy,
  );
}

/** Translates every point of one object exactly once, preserving topology and other objects. */
export function moveObject(
  scene: Scene2D,
  id: string,
  delta: Point,
  policy = defaultEnginePolicy,
): Scene2D {
  if (!scene.objects.some((object) => object.id === id))
    throw new Error("Unknown object");
  return moveSceneSelections(
    scene,
    [{ objectId: id, target: null }],
    delta,
    policy,
  );
}

/** Adds a rectangle, triangle or empty mesh using caller-supplied identity and translated name. */
export function addObject(
  scene: Scene2D,
  id: string,
  name: string,
  shape: "rectangle" | "triangle" | "empty",
  policy = defaultEnginePolicy,
): Scene2D {
  if (!policy.createObjects) throw new Error("Object creation disabled");
  let mesh: Mesh2D = { vertices: [], edges: [], faces: [] };
  if (shape === "rectangle") mesh = rectangleMesh(3, 2);
  if (shape === "triangle")
    mesh.vertices = [
      { id: "a", x: 0, y: -1 },
      { id: "b", x: 1.5, y: 1 },
      { id: "c", x: -1.5, y: 1 },
    ];
  if (shape !== "empty")
    mesh = createFace(
      mesh,
      mesh.vertices.map((vertex) => vertex.id),
      "face-1",
    );
  if (!policy.createFaces) mesh = { ...mesh, faces: [] };
  return parseScene(
    {
      ...scene,
      objects: [...scene.objects, { id, name, mesh, origin: { x: 0, y: 0 } }],
    },
    policy,
  );
}

/** Produces a standalone SVG drawing, escaping user names and validating all geometry first. */
export function exportSceneSvg(
  value: Scene2D,
  policy = defaultEnginePolicy,
): string {
  const scene = parseScene(value, policy);
  const vertices = scene.objects.flatMap((object) => object.mesh.vertices);
  const minX = vertices.length
    ? Math.min(...vertices.map((v) => v.x)) - 0.25
    : -2;
  const minY = vertices.length
    ? Math.min(...vertices.map((v) => v.y)) - 0.25
    : -2;
  const width = vertices.length
    ? Math.max(...vertices.map((v) => v.x)) - minX + 0.25
    : 4;
  const height = vertices.length
    ? Math.max(...vertices.map((v) => v.y)) - minY + 0.25
    : 4;
  const escape = (value: string) =>
    value.replace(
      /[&<>"']/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&apos;",
        })[char]!,
    );
  const objects = scene.objects
    .map((object) => {
      const vertex = (id: string) =>
        object.mesh.vertices.find((v) => v.id === id)!;
      const faces = (object.mesh.faces ?? [])
        .map(
          (face) =>
            `<polygon points="${face.vertices.map((id) => `${vertex(id).x},${vertex(id).y}`).join(" ")}" fill="#99c9dd" fill-opacity="0.55"/>`,
        )
        .join("");
      const edges = object.mesh.edges
        .map(
          (edge) =>
            `<line x1="${vertex(edge.start).x}" y1="${vertex(edge.start).y}" x2="${vertex(edge.end).x}" y2="${vertex(edge.end).y}" stroke="#24465b" stroke-width="0.02"/>`,
        )
        .join("");
      const points = object.mesh.vertices
        .filter(
          (v) =>
            !object.mesh.edges.some((e) => e.start === v.id || e.end === v.id),
        )
        .map(
          (v) => `<circle cx="${v.x}" cy="${v.y}" r="0.035" fill="#24465b"/>`,
        )
        .join("");
      return `<g id="${object.id}"><title>${escape(object.name)}</title>${faces}${edges}${points}</g>`;
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${width} ${height}" width="${width * 100}" height="${height * 100}">${objects}</svg>`;
}

/** Moves only the pivot, leaving world-space geometry unchanged. */
export function setObjectOrigin(
  scene: Scene2D,
  id: string,
  origin: Point,
  policy = defaultEnginePolicy,
): Scene2D {
  if (!scene.objects.some((o) => o.id === id))
    throw new Error("Unknown object");
  return parseScene(
    {
      ...scene,
      objects: scene.objects.map((o) => (o.id === id ? { ...o, origin } : o)),
    },
    policy,
  );
}

/** Returns one object's origin, the mean of selected object origins, or the mean of unique selected mesh points. */
export function rotationPivot(
  scene: Scene2D,
  selections: readonly SceneSelection[],
): Point | null {
  const points: Point[] = [];
  let whole = false;
  for (const object of scene.objects) {
    const local = selections.filter((s) => s.objectId === object.id);
    if (local.some((s) => s.target === null)) {
      points.push(objectOrigin(object));
      whole = true;
      continue;
    }
    const ids = new Set(
      local.flatMap((s) => selectionVertices(object.mesh, s.target)),
    );
    points.push(...object.mesh.vertices.filter((v) => ids.has(v.id)));
  }
  if (!points.length || (!whole && points.length < 2)) return null;
  return {
    x: points.reduce((s, p) => s + p.x, 0) / points.length,
    y: points.reduce((s, p) => s + p.y, 0) / points.length,
  };
}

/** Rotates selected points once around the selection pivot; whole-object origins follow group rotation. Positive degrees rotate clockwise in Y-down coordinates. */
export function rotateSceneSelections(
  scene: Scene2D,
  selections: readonly SceneSelection[],
  degrees: number,
  policy = defaultEnginePolicy,
): Scene2D {
  const source = parseScene(scene, policy);
  const pivot = rotationPivot(source, selections);
  if (!pivot || !Number.isFinite(degrees)) throw new Error("Invalid rotation");
  const radians = ((degrees % 360) * Math.PI) / 180;
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  const rounded = (value: number) => {
    const result = Number(value.toFixed(6));
    return Object.is(result, -0) ? 0 : result;
  };
  const rotate = (point: Point): Point => ({
    x: rounded(
      pivot.x + (point.x - pivot.x) * cosine - (point.y - pivot.y) * sine,
    ),
    y: rounded(
      pivot.y + (point.x - pivot.x) * sine + (point.y - pivot.y) * cosine,
    ),
  });
  return parseScene(
    {
      ...source,
      objects: source.objects.map((object) => {
        const local = selections.filter((s) => s.objectId === object.id);
        const whole = local.some((s) => s.target === null);
        const ids = new Set(
          local.flatMap((s) =>
            s.target
              ? selectionVertices(object.mesh, s.target)
              : object.mesh.vertices.map((v) => v.id),
          ),
        );
        if (!local.length) return object;
        return {
          ...object,
          origin: whole ? rotate(objectOrigin(object)) : object.origin,
          mesh: {
            ...object.mesh,
            vertices: object.mesh.vertices.map((v) =>
              ids.has(v.id) ? { ...v, ...rotate(v) } : v,
            ),
          },
        };
      }),
    },
    policy,
  );
}
