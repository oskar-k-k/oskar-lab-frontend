import {
  defaultConstraints,
  parseMesh,
  rectangleMesh,
  createFace,
  type Mesh2D,
  type MeshConstraints,
  type Point,
  type MeshSelection,
  translateSelection,
} from "./mesh";

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
export type SceneObject = { id: string; name: string; mesh: Mesh2D };
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
/** General-purpose defaults, independent of any floor-plan rules. */
export const defaultEnginePolicy: EnginePolicy = {
  maxObjects: 64,
  mesh: defaultConstraints,
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
    return {
      id: object.id,
      name: object.name.trim(),
      mesh: parseMesh(object.mesh, policy.mesh),
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
      objects: scene.objects.map((object) =>
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
  const object = scene.objects.find((object) => object.id === id);
  if (!object || !Number.isFinite(delta.x) || !Number.isFinite(delta.y))
    throw new Error("Invalid object movement");
  const mesh = {
    ...object.mesh,
    vertices: object.mesh.vertices.map((vertex) => ({
      ...vertex,
      x: Math.round((vertex.x + delta.x) * 1e6) / 1e6,
      y: Math.round((vertex.y + delta.y) * 1e6) / 1e6,
    })),
  };
  return replaceObjectMesh(scene, id, mesh, policy);
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
    { ...scene, objects: [...scene.objects, { id, name, mesh }] },
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
