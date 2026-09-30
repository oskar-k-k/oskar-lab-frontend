import {
  createFace,
  deleteSelection,
  selectionVertices,
  splitEdge,
  type Mesh2D,
  type MeshSelection,
} from "./mesh";
import {
  defaultEnginePolicy,
  parseScene,
  objectOrigin,
  type EnginePolicy,
  type Scene2D,
  type SceneSelection,
} from "./scene";

/** Topology commands apply to the entire selection as one validated, undoable change. */
export type SelectionAction =
  | "delete"
  | "deleteBoundary"
  | "deleteVertices"
  | "split"
  | "connect"
  | "face"
  | "duplicate";

function uniqueIdFactory(scene: Scene2D) {
  const used = new Set(
    scene.objects.flatMap((o) => [
      o.id,
      ...o.mesh.vertices.map((v) => v.id),
      ...o.mesh.edges.map((e) => e.id),
      ...(o.mesh.faces ?? []).map((f) => f.id),
    ]),
  );
  let index = 1;
  return () => {
    while (used.has(`edit-${index}`)) index++;
    const id = `edit-${index++}`;
    used.add(id);
    return id;
  };
}

function selectedRing(mesh: Mesh2D, targets: MeshSelection[]): string[] {
  if (targets.every((t) => t?.kind === "vertex")) {
    const points = targets.map((t) =>
      mesh.vertices.find((v) => v.id === t!.id)!,
    );
    const center = {
      x: points.reduce((s, v) => s + v.x, 0) / points.length,
      y: points.reduce((s, v) => s + v.y, 0) / points.length,
    };
    return [...points]
      .sort(
        (a, b) =>
          Math.atan2(a.y - center.y, a.x - center.x) -
          Math.atan2(b.y - center.y, b.x - center.x),
      )
      .map((v) => v.id);
  }
  if (!targets.every((t) => t?.kind === "edge"))
    throw new Error("Select vertices or an edge chain");
  const edges = targets.map((t) => mesh.edges.find((e) => e.id === t!.id)!);
  const neighbors = new Map<string, string[]>();
  for (const edge of edges) {
    neighbors.set(edge.start, [...(neighbors.get(edge.start) ?? []), edge.end]);
    neighbors.set(edge.end, [...(neighbors.get(edge.end) ?? []), edge.start]);
  }
  if ([...neighbors.values()].some((n) => n.length > 2))
    throw new Error("Branched boundary");
  const start =
    [...neighbors.keys()].find((id) => neighbors.get(id)!.length === 1) ??
    edges[0]?.start;
  if (!start) throw new Error("Empty boundary");
  const ring = [start];
  let previous: string | undefined;
  let current = start;
  while (true) {
    const next = neighbors.get(current)!.find((id) => id !== previous);
    if (!next || next === start) break;
    if (ring.includes(next)) throw new Error("Invalid boundary");
    ring.push(next);
    previous = current;
    current = next;
  }
  if (ring.length !== neighbors.size) throw new Error("Disconnected boundary");
  return ring;
}

/** Drops stale selection IDs after undo, import or topology edits; object-local IDs remain independent. */
export function validSceneSelections(
  scene: Scene2D,
  selections: readonly SceneSelection[],
): SceneSelection[] {
  const seen = new Set<string>();
  return selections.filter((item) => {
    const object = scene.objects.find((o) => o.id === item.objectId);
    const key = JSON.stringify(item);
    if (!object || seen.has(key)) return false;
    seen.add(key);
    return (
      item.target === null ||
      selectionVertices(object.mesh, item.target).length > 0
    );
  });
}

/** Executes a selection command atomically; throws for invalid topology, cross-object joins or host-policy violations. */
export function applySelectionAction(
  scene: Scene2D,
  selections: readonly SceneSelection[],
  action: SelectionAction,
  policy: EnginePolicy = defaultEnginePolicy,
): { scene: Scene2D; selections: SceneSelection[] } {
  scene = parseScene(scene, policy);
  const picks = validSceneSelections(scene, selections);
  if (!picks.length || picks.length !== selections.length)
    throw new Error("Invalid selection");
  const id = uniqueIdFactory(scene);
  const result: SceneSelection[] = [];
  if (action === "face" || action === "connect") {
    if (new Set(picks.map((p) => p.objectId)).size !== 1)
      throw new Error("Cannot connect independent objects");
    if (action === "face" && !policy.createFaces)
      throw new Error("Face creation disabled");
  }
  if (
    action === "duplicate" &&
    (!policy.createObjects || picks.some((p) => p.target))
  )
    throw new Error("Object duplication disabled");
  const objects = scene.objects.flatMap((object) => {
    const local = picks.filter((p) => p.objectId === object.id);
    if (!local.length) return [object];
    const targets = local.map((p) => p.target);
    if (action === "duplicate") {
      const copy = {
        ...object,
        id: id(),
        origin: {
          x: objectOrigin(object).x + 0.5,
          y: objectOrigin(object).y + 0.5,
        },
        mesh: {
          ...object.mesh,
          vertices: object.mesh.vertices.map((v) => ({
            ...v,
            x: v.x + 0.5,
            y: v.y + 0.5,
          })),
        },
      };
      result.push({ objectId: copy.id, target: null });
      return [object, copy];
    }
    if (targets.some((t) => t === null)) {
      if (action !== "delete") throw new Error("Select topology elements");
      return [];
    }
    let mesh = object.mesh;
    if (action === "deleteVertices") {
      const vertices = new Set(
        targets.flatMap((t) => selectionVertices(mesh, t)),
      );
      for (const vertex of vertices)
        mesh = deleteSelection(mesh, { kind: "vertex", id: vertex });
    } else if (action === "deleteBoundary") {
      if (!targets.every((t) => t?.kind === "face"))
        throw new Error("Select faces");
      const edges = mesh.edges.filter((e) =>
        targets.some((t) => {
          const ring = mesh.faces!.find((f) => f.id === t!.id)!.vertices;
          return ring.some(
            (v, i) =>
              (v === e.start && ring[(i + 1) % ring.length] === e.end) ||
              (v === e.end && ring[(i + 1) % ring.length] === e.start),
          );
        }),
      );
      for (const edge of edges)
        mesh = deleteSelection(mesh, { kind: "edge", id: edge.id });
    } else if (action === "delete") {
      for (const target of targets) mesh = deleteSelection(mesh, target);
    } else if (action === "split") {
      if (!targets.every((t) => t?.kind === "edge"))
        throw new Error("Select edges");
      for (const target of targets) {
        const vertexId = id();
        mesh = splitEdge(mesh, target!.id, vertexId, id());
        result.push({
          objectId: object.id,
          target: { kind: "vertex", id: vertexId },
        });
      }
    } else if (action === "connect") {
      if (targets.length !== 2 || !targets.every((t) => t?.kind === "vertex"))
        throw new Error("Select two vertices");
      const [start, end] = targets.map((t) => t!.id);
      if (
        mesh.edges.some(
          (e) =>
            (e.start === start && e.end === end) ||
            (e.start === end && e.end === start),
        )
      )
        throw new Error("Already connected");
      const edgeId = id();
      mesh = { ...mesh, edges: [...mesh.edges, { id: edgeId, start, end }] };
      result.push({
        objectId: object.id,
        target: { kind: "edge", id: edgeId },
      });
    } else if (action === "face") {
      const ring = selectedRing(mesh, targets);
      if (ring.length < 3) throw new Error("Select at least three vertices");
      const faceId = id();
      mesh = createFace(mesh, ring, faceId);
      result.push({
        objectId: object.id,
        target: { kind: "face", id: faceId },
      });
    }
    return [{ ...object, mesh }];
  });
  return {
    scene: parseScene({ ...scene, objects }, policy),
    selections: result,
  };
}

/** Checks command availability using the same validation as execution, without changing the scene. */
export function canApplySelectionAction(
  scene: Scene2D,
  selections: readonly SceneSelection[],
  action: SelectionAction,
  policy: EnginePolicy = defaultEnginePolicy,
): boolean {
  try {
    applySelectionAction(scene, selections, action, policy);
    return true;
  } catch {
    return false;
  }
}
