"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { useI18n } from "@oskar-lab/i18n/I18nProvider";
import {
  addObject,
  defaultEnginePolicy,
  moveObject,
  objectOrigin,
  setObjectOrigin,
  rotationPivot,
  rotateSceneSelections,
  scaleSceneSelections,
  constrainSelectionPivot,
  moveSceneSelections,
  type SceneSelection,
  parseScene,
  replaceObjectMesh,
  type EnginePolicy,
  type Scene2D,
  type SelectionMode,
} from "../model/scene";
import {
  meshBounds,
  createFace,
  type MeshSelection,
  type Mesh2D,
  type Point,
} from "../model/mesh";
import {
  defaultMeasurements,
  snapCoordinate,
  type Measurements,
} from "../model/measurements";
import {
  applySelectionAction,
  canApplySelectionAction,
  validSceneSelections,
  type SelectionAction,
} from "../model/selectionActions";
import SelectionWheel, { type WheelItem } from "./SelectionWheel";
import LabIcon, { type LabIconName } from "./LabIcon";
import TransformGizmo from "./TransformGizmo";
import SceneGeometry from "./SceneGeometry";
import Inspector2D from "./Inspector2D";
import Measure from "./Measure";
import styles from "./SceneEditor.module.css";

/** Host notifications carry serializable state; persistence and integrations remain outside the engine. */
export type SceneEditorEvent =
  | { type: "selection"; objectId: string | null }
  | { type: "change"; scene: Scene2D };
/** Controlled scene surface with explicit capability policy and optional host history. */
export type SceneEditorProps = {
  value: Scene2D;
  onChange: (scene: Scene2D) => void;
  policy?: EnginePolicy;
  measurements?: Measurements;
  onEvent?: (event: SceneEditorEvent) => void;
  undo?: () => void;
  redo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
};

function bounds(scene: Scene2D) {
  return meshBounds({
    vertices: scene.objects.flatMap((object) => [
      ...object.mesh.vertices,
      { id: `origin-${object.id}`, ...objectOrigin(object) },
    ]),
    edges: [],
  });
}

/** Combines object placement and focused mesh editing without storage, routing or domain dependencies. */
export default function SceneEditor({
  value,
  onChange,
  policy = defaultEnginePolicy,
  measurements = defaultMeasurements,
  onEvent,
  undo,
  redo,
  canUndo,
  canRedo,
}: SceneEditorProps) {
  const { t } = useI18n();
  const gridId = useId();
  const [selectedId, setSelectedId] = useState<string | null>(
    value.objects[0]?.id ?? null,
  );
  const [mode, setMode] = useState<SelectionMode>(policy.modes[0] ?? "object");
  const [picks, setPicks] = useState<SceneSelection[]>(
    value.objects[0] ? [{ objectId: value.objects[0].id, target: null }] : [],
  );
  const [wheel, setWheel] = useState<{
    x: number;
    y: number;
    point: Point;
    picks: SceneSelection[];
  } | null>(null);
  const [rotating, setRotating] = useState(false);
  const [scaling, setScaling] = useState(false);
  const [scaleX, setScaleX] = useState("1");
  const [scaleY, setScaleY] = useState("1");
  const [temporaryPivots, setTemporaryPivots] = useState<
    Partial<Record<"rotate" | "scale", { key: string; point: Point }>>
  >({});
  const [feedback, setFeedback] = useState<{
    degrees: number | null;
    factors: Point | null;
  }>({ degrees: null, factors: null });
  const pivotDrag = useRef<{
    tool: "rotate" | "scale";
    key: string;
    previous: typeof temporaryPivots;
    pointerId: number;
  } | null>(null);
  const [angle, setAngle] = useState("15");
  const [panTool, setPanTool] = useState(false);
  const spaceHeld = useRef(false);
  const hovered = useRef(false);
  const pan = useRef<{
    x: number;
    y: number;
    centerX: number;
    centerY: number;
    scaleX: number;
    scaleY: number;
    pointerId: number;
  } | null>(null);
  const [selection, setSelection] = useState<MeshSelection>(null);
  const [drawing, setDrawing] = useState(false);
  const [anchor, setAnchor] = useState<string | null>(null);
  const [facePoints, setFacePoints] = useState<string[]>([]);
  const [newPoint, setNewPoint] = useState<Point>({ x: 0, y: 0 });
  const [draft, setDraft] = useState<Scene2D | null>(null);
  const [error, setError] = useState(false);
  const [frame, setFrame] = useState(() => bounds(value));
  const [zoom, setZoom] = useState(1);
  const svg = useRef<SVGSVGElement>(null);
  const previewFrame = useRef<number | null>(null);
  const pendingPointer = useRef<{
    clientX: number;
    clientY: number;
    pointerId: number;
    shiftKey?: boolean;
  } | null>(null);
  useEffect(
    () => () => {
      if (previewFrame.current !== null)
        cancelAnimationFrame(previewFrame.current);
    },
    [],
  );
  const gesture = useRef<{
    scene: Scene2D;
    id: string;
    start: Point;
    pointerId: number;
    rotation?: { pivot: Point; lastAngle: number; total: number };
    scale?: { pivot: Point; axis: "x" | "y" | "xy"; radius: number };
    selections: SceneSelection[];
  } | null>(null);
  const scene = draft ?? value;
  const selected = scene.objects.find((object) => object.id === selectedId);
  const activeMode = policy.modes.includes(mode)
    ? mode
    : (policy.modes[0] ?? "object");
  const size = (Math.max(frame.width, frame.height, 6) + 2) / zoom;
  const view = {
    x: frame.centerX - size / 2,
    y: frame.centerY - size / 2,
    size,
  };

  useEffect(() => {
    function keyDown(event: globalThis.KeyboardEvent) {
      const target = event.target;
      const editing =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
      if (event.code === "Space" && hovered.current && !editing) {
        event.preventDefault();
        spaceHeld.current = true;
      }
    }
    function release(event?: Event) {
      if (
        !(event instanceof globalThis.KeyboardEvent) ||
        event.code === "Space"
      )
        spaceHeld.current = false;
    }
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", release);
    window.addEventListener("blur", release);
    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", release);
      window.removeEventListener("blur", release);
    };
  }, []);

  useEffect(() => {
    const element = svg.current;
    if (!element) return;
    function wheel(event: WheelEvent) {
      event.preventDefault();
      if (gesture.current || pan.current) return;
      const matrix = element!.getScreenCTM();
      if (!matrix) return;
      const cursor = new DOMPoint(event.clientX, event.clientY).matrixTransform(
        matrix.inverse(),
      );
      const delta =
        event.deltaY *
        (event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? element!.clientHeight
            : 1);
      const nextZoom = Math.max(
        0.02,
        Math.min(200, zoom * Math.exp(-delta * 0.0015)),
      );
      const ratio = zoom / nextZoom;
      setFrame((f) => ({
        ...f,
        centerX: cursor.x + (f.centerX - cursor.x) * ratio,
        centerY: cursor.y + (f.centerY - cursor.y) * ratio,
      }));
      setZoom(nextZoom);
    }
    element.addEventListener("wheel", wheel, { passive: false });
    return () => element.removeEventListener("wheel", wheel);
  }, [zoom]);
  function isPicked(item: SceneSelection) {
    return picks.some(
      (p) =>
        p.objectId === item.objectId &&
        p.target?.kind === item.target?.kind &&
        p.target?.id === item.target?.id,
    );
  }
  function choose(objectId: string, target: MeshSelection, toggle: boolean) {
    const item = { objectId, target };
    const next = toggle
      ? isPicked(item)
        ? picks.filter(
            (p) =>
              !(
                p.objectId === objectId &&
                p.target?.kind === target?.kind &&
                p.target?.id === target?.id
              ),
          )
        : [...picks, item]
      : isPicked(item)
        ? picks
        : [item];
    const active =
      next.find(
        (p) =>
          p.objectId === objectId &&
          p.target?.kind === target?.kind &&
          p.target?.id === target?.id,
      ) ?? next[next.length - 1];
    setPicks(next);
    select(active?.objectId ?? null);
    setSelection(active?.target ?? null);
    return next;
  }
  function startPan(event: PointerEvent<SVGSVGElement>) {
    if (!(
      event.button === 1 ||
      (event.button === 0 && (spaceHeld.current || panTool))
    ))
      return;
    event.preventDefault();
    event.stopPropagation();
    const matrix = event.currentTarget.getScreenCTM();
    if (!matrix) return;
    pan.current = {
      x: event.clientX,
      y: event.clientY,
      centerX: frame.centerX,
      centerY: frame.centerY,
      scaleX: matrix.a,
      scaleY: matrix.d,
      pointerId: event.pointerId,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function select(id: string | null) {
    if (id !== selectedId) {
      setSelection(null);
      setAnchor(null);
      setFacePoints([]);
    }
    setSelectedId(id);
    onEvent?.({ type: "selection", objectId: id });
  }
  function commit(next: Scene2D) {
    try {
      const validated = parseScene(next, policy);
      setError(false);
      if (JSON.stringify(validated) === JSON.stringify(value)) return true;
      onChange(validated);
      onEvent?.({ type: "change", scene: validated });
      return true;
    } catch {
      setError(true);
      return false;
    }
  }
  function add(shape: "rectangle" | "triangle" | "empty", position?: Point) {
    try {
      const id = crypto.randomUUID();
      const next = addObject(
        value,
        id,
        t("scene2d.objectNumber", { number: value.objects.length + 1 }),
        shape,
        policy,
      );
      if (!commit(position ? moveObject(next, id, position, policy) : next))
        return;
      select(id);
      setPicks(activeMode === "object" ? [{ objectId: id, target: null }] : []);
      if (shape === "empty" && policy.modes.includes("vertex"))
        setMode("vertex");
    } catch {
      setError(true);
    }
  }
  function point(event: { clientX: number; clientY: number }): Point {
    const matrix = svg.current?.getScreenCTM();
    if (!matrix) return { x: 0, y: 0 };
    const result = new DOMPoint(event.clientX, event.clientY).matrixTransform(
      matrix.inverse(),
    );
    return { x: result.x, y: result.y };
  }
  function moved(event: {
    clientX: number;
    clientY: number;
    pointerId: number;
    shiftKey?: boolean;
  }) {
    const current = gesture.current;
    if (!current || current.pointerId !== event.pointerId) return null;
    const target = point(event);
    if (current.rotation) {
      const rotation = current.rotation;
      const angle = Math.atan2(
        target.y - rotation.pivot.y,
        target.x - rotation.pivot.x,
      );
      const difference = angle - rotation.lastAngle;
      rotation.total +=
        (Math.atan2(Math.sin(difference), Math.cos(difference)) * 180) /
        Math.PI;
      rotation.lastAngle = angle;
      const degrees = event.shiftKey
        ? Math.round(rotation.total / 15) * 15
        : rotation.total;
      setFeedback({ degrees, factors: null });
      return rotateSceneSelections(
        current.scene,
        current.selections,
        degrees,
        policy,
        rotation.pivot,
      );
    }
    if (current.scale) {
      const { pivot, axis, radius } = current.scale;
      const dx = (target.x - current.start.x) / radius;
      const dy = -(target.y - current.start.y) / radius;
      const both = 1 + (dx + dy) / 1.5;
      let factors = {
        x: axis === "y" ? 1 : axis === "xy" ? both : 1 + dx,
        y: axis === "x" ? 1 : axis === "xy" ? both : 1 + dy,
      };
      if (event.shiftKey)
        factors = {
          x: Math.round(factors.x * 10) / 10,
          y: Math.round(factors.y * 10) / 10,
        };
      setFeedback({ degrees: null, factors });
      return scaleSceneSelections(
        current.scene,
        current.selections,
        factors,
        policy,
        pivot,
      );
    }
    const snap = (number: number) =>
      measurements.snap ? snapCoordinate(number, measurements) : number;
    return moveSceneSelections(
      current.scene,
      current.selections,
      {
        x: snap(target.x - current.start.x),
        y: snap(target.y - current.start.y),
      },
      policy,
    );
  }
  function editMesh(mesh: Mesh2D) {
    if (!selected) return false;
    try {
      return commit(replaceObjectMesh(value, selected.id, mesh, policy));
    } catch {
      setError(true);
      return false;
    }
  }
  function fillFace() {
    if (!selected || !policy.createFaces || facePoints.length < 3) return;
    const id = crypto.randomUUID();
    if (editMesh(createFace(selected.mesh, facePoints, id))) {
      setFacePoints([]);
      setSelection({ kind: "face", id });
      setPicks([{ objectId: selected.id, target: { kind: "face", id } }]);
      setMode("face");
    }
  }
  function appendPoint(position: Point, existingId?: string) {
    if (!selected) return;
    const id = existingId ?? crypto.randomUUID();
    const mesh = selected.mesh;
    const vertices = existingId
      ? mesh.vertices
      : [
          ...mesh.vertices,
          {
            id,
            x: measurements.snap
              ? snapCoordinate(position.x, measurements)
              : position.x,
            y: measurements.snap
              ? snapCoordinate(position.y, measurements)
              : position.y,
          },
        ];
    const edges =
      anchor &&
      anchor !== id &&
      !mesh.edges.some(
        (e) =>
          (e.start === anchor && e.end === id) ||
          (e.start === id && e.end === anchor),
      )
        ? [...mesh.edges, { id: crypto.randomUUID(), start: anchor, end: id }]
        : mesh.edges;
    if (editMesh({ ...mesh, vertices, edges })) {
      setAnchor(id);
      setSelection({ kind: "vertex", id });
      setPicks([{ objectId: selected.id, target: { kind: "vertex", id } }]);
    }
  }
  function begin(
    event: PointerEvent<SVGElement>,
    objectId: string,
    target: MeshSelection,
  ) {
    if (event.button !== 0 || !event.isPrimary) return;
    setWheel(null);
    event.stopPropagation();
    if (drawing && target?.kind === "vertex" && objectId === selectedId) {
      appendPoint(point(event), target.id);
      return;
    }
    event.preventDefault();
    event.currentTarget.focus();
    const selections = choose(objectId, target, event.ctrlKey || event.metaKey);
    if (event.ctrlKey || event.metaKey) return;
    if (rotating && rotationPivot(value, selections)) {
      startRotation(event, selections);
      return;
    }
    gesture.current = {
      scene: value,
      id: objectId,
      selections,
      start: point(event),
      pointerId: event.pointerId,
    };
    svg.current?.setPointerCapture(event.pointerId);
  }
  function keyboard(
    event: KeyboardEvent<SVGElement>,
    objectId: string,
    target: MeshSelection,
  ) {
    const directions: Record<string, Point> = {
      ArrowLeft: { x: -measurements.step, y: 0 },
      ArrowRight: { x: measurements.step, y: 0 },
      ArrowUp: { x: 0, y: -measurements.step },
      ArrowDown: { x: 0, y: measurements.step },
    };
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      choose(objectId, target, event.ctrlKey || event.metaKey);
    }
    if (!directions[event.key]) return;
    event.preventDefault();
    const selections = choose(objectId, target, false);
    try {
      commit(
        moveSceneSelections(value, selections, directions[event.key], policy),
      );
    } catch {
      setError(true);
    }
  }

  function stopPreview() {
    if (previewFrame.current !== null)
      cancelAnimationFrame(previewFrame.current);
    previewFrame.current = null;
    pendingPointer.current = null;
  }
  function queuePreview(event: PointerEvent) {
    if (!gesture.current) return;
    pendingPointer.current = {
      clientX: event.clientX,
      clientY: event.clientY,
      pointerId: event.pointerId,
      shiftKey: event.shiftKey,
    };
    if (previewFrame.current !== null) return;
    previewFrame.current = requestAnimationFrame(() => {
      previewFrame.current = null;
      const pointer = pendingPointer.current;
      pendingPointer.current = null;
      if (!pointer) return;
      try {
        const next = moved(pointer);
        if (next) setDraft(next);
      } catch {
        // Constrained hosts keep the last valid preview; report rejection only on release.
      }
    });
  }
  function cancel() {
    if (pivotDrag.current) setTemporaryPivots(pivotDrag.current.previous);
    pivotDrag.current = null;
    setFeedback({ degrees: null, factors: null });
    stopPreview();
    setWheel(null);
    gesture.current = null;
    pan.current = null;
    setDraft(null);
    setError(false);
  }
  function nudge(delta: Point) {
    if (!selected) return;
    try {
      commit(moveObject(value, selected.id, delta, policy));
    } catch {
      setError(true);
    }
  }
  function duplicate() {
    if (!selected || !policy.createObjects) return;
    try {
      const id = crypto.randomUUID();
      const next = parseScene(
        {
          ...value,
          objects: [
            ...value.objects,
            {
              ...selected,
              id,
              name: t("scene2d.copyName", { name: selected.name }).slice(
                0,
                100,
              ),
            },
          ],
        },
        policy,
      );
      commit(moveObject(next, id, { x: 0.5, y: 0.5 }, policy));
      select(id);
      setPicks(activeMode === "object" ? [{ objectId: id, target: null }] : []);
    } catch {
      setError(true);
    }
  }
  function selectionKey(targets = picks) {
    return JSON.stringify(
      targets
        .map((p) => [p.objectId, p.target?.kind, p.target?.id])
        .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
    );
  }
  function pivotFor(tool: "rotate" | "scale", targets = picks): Point | null {
    const custom = temporaryPivots[tool];
    if (custom?.key === selectionKey(targets))
      return constrainSelectionPivot(value, targets, custom.point);
    return rotationPivot(value, validSceneSelections(value, targets));
  }
  function movePivot(position: Point) {
    const tool = scaling ? "scale" : "rotate";
    const next = constrainSelectionPivot(value, picks, position);
    if (next)
      setTemporaryPivots((current) => ({
        ...current,
        [tool]: { key: selectionKey(), point: next },
      }));
  }
  function startPivotDrag(event: PointerEvent<SVGElement>) {
    if (event.button !== 0 || !event.isPrimary) return;
    event.preventDefault();
    event.stopPropagation();
    pivotDrag.current = {
      tool: scaling ? "scale" : "rotate",
      key: selectionKey(),
      previous: temporaryPivots,
      pointerId: event.pointerId,
    };
    svg.current?.setPointerCapture(event.pointerId);
  }
  function scaleBy(factors: Point) {
    try {
      commit(
        scaleSceneSelections(
          value,
          validSceneSelections(value, picks),
          factors,
          policy,
          pivotFor("scale") ?? undefined,
        ),
      );
    } catch {
      setError(true);
    }
  }
  function startScale(event: PointerEvent<SVGElement>, axis: "x" | "y" | "xy") {
    if (event.button !== 0 || !event.isPrimary) return;
    event.preventDefault();
    event.stopPropagation();
    const pivot = pivotFor("scale");
    if (!pivot) return;
    gesture.current = {
      scene: value,
      id: picks[0].objectId,
      selections: picks,
      start: point(event),
      pointerId: event.pointerId,
      scale: { pivot, axis, radius: size * 0.14 },
    };
    setFeedback({ degrees: null, factors: { x: 1, y: 1 } });
    svg.current?.setPointerCapture(event.pointerId);
  }
  function rotateBy(degrees: number) {
    try {
      commit(
        rotateSceneSelections(
          value,
          validSceneSelections(value, picks),
          degrees,
          policy,
          pivotFor("rotate") ?? undefined,
        ),
      );
    } catch {
      setError(true);
    }
  }
  function startRotation(event: PointerEvent<SVGElement>, targets = picks) {
    if (event.button !== 0 || !event.isPrimary) return;
    event.preventDefault();
    event.stopPropagation();
    const pivot = pivotFor("rotate", targets);
    if (!pivot) return;
    const start = point(event);
    gesture.current = {
      scene: value,
      id: targets[0].objectId,
      selections: targets,
      start,
      pointerId: event.pointerId,
      rotation: {
        pivot,
        lastAngle: Math.atan2(start.y - pivot.y, start.x - pivot.x),
        total: 0,
      },
    };
    setFeedback({ degrees: 0, factors: null });
    svg.current?.setPointerCapture(event.pointerId);
  }
  function editOrigin(origin: Point) {
    if (!selected) return;
    try {
      commit(setObjectOrigin(value, selected.id, origin, policy));
    } catch {
      setError(true);
    }
  }
  function closeWheel() {
    setWheel(null);
    svg.current?.focus({ preventScroll: true });
  }
  function openWheelAt(x: number, y: number, targets: SceneSelection[]) {
    cancel();
    hovered.current = false;
    spaceHeld.current = false;
    setDrawing(false);
    setWheel({
      x,
      y,
      point: point({ clientX: x, clientY: y }),
      picks: targets,
    });
  }
  function openWheel(event: MouseEvent<SVGElement>, target?: SceneSelection) {
    event.preventDefault();
    event.stopPropagation();
    const targets = target
      ? choose(target.objectId, target.target, false)
      : validSceneSelections(value, picks);
    openWheelAt(event.clientX, event.clientY, targets);
  }
  function runAction(action: SelectionAction, targets: SceneSelection[]) {
    try {
      const next = applySelectionAction(value, targets, action, policy);
      if (!commit(next.scene)) return;
      setPicks(next.selections);
      const active = next.selections.at(-1);
      select(active?.objectId ?? null);
      setSelection(active?.target ?? null);
      const nextMode = active?.target?.kind ?? "object";
      if (active && policy.modes.includes(nextMode)) setMode(nextMode);
      setAnchor(null);
      setDrawing(false);
    } catch {
      setError(true);
    }
  }
  function createAtCursor(edge: boolean) {
    if (!wheel) return;
    try {
      const objectId = selected?.id ?? crypto.randomUUID();
      const next = selected
        ? value
        : addObject(
            value,
            objectId,
            t("scene2d.objectNumber", { number: value.objects.length + 1 }),
            "empty",
            policy,
          );
      const object = next.objects.find((o) => o.id === objectId)!;
      const vertexId = crypto.randomUUID();
      const position = measurements.snap
        ? {
            x: snapCoordinate(wheel.point.x, measurements),
            y: snapCoordinate(wheel.point.y, measurements),
          }
        : wheel.point;
      const mesh = {
        ...object.mesh,
        vertices: [...object.mesh.vertices, { id: vertexId, ...position }],
      };
      if (
        !commit(
          replaceObjectMesh(
            selected ? next : setObjectOrigin(next, objectId, position, policy),
            objectId,
            mesh,
            policy,
          ),
        )
      )
        return;
      select(objectId);
      setMode("vertex");
      setPicks([{ objectId, target: { kind: "vertex", id: vertexId } }]);
      setSelection({ kind: "vertex", id: vertexId });
      setAnchor(edge ? vertexId : null);
      setDrawing(edge);
    } catch {
      setError(true);
    }
  }
  function wheelItems(): WheelItem[] {
    if (!wheel) return [];
    const targets = wheel.picks;
    const kind = targets[0]?.target?.kind ?? "object";
    const sameKind = targets.every(
      (p) => (p.target?.kind ?? "object") === kind,
    );
    const command = (
      action: SelectionAction,
      label: Parameters<typeof t>[0],
      icon: LabIconName,
    ): WheelItem => ({
      id: action,
      label: t(label),
      icon,
      disabled: !canApplySelectionAction(value, targets, action, policy),
      hint:
        action === "face" || action === "connect"
          ? t("scene2d.wheelJoinHint")
          : undefined,
      run: () => runAction(action, targets),
    });
    const creation: WheelItem[] = [];
    if (policy.modes.includes("vertex") && (selected || policy.createObjects)) {
      const disabled = !selected && value.objects.length >= policy.maxObjects;
      creation.push(
        {
          id: "point",
          label: t("scene2d.wheelPoint"),
          icon: "point",
          disabled,
          run: () => createAtCursor(false),
        },
        {
          id: "edge",
          label: t("lab2d.drawEdges"),
          icon: "draw",
          disabled,
          run: () => createAtCursor(true),
        },
      );
    }
    if (policy.createObjects)
      for (const shape of ["rectangle", "triangle"] as const)
        creation.push({
          id: shape,
          label: t(`scene2d.${shape}`),
          icon: shape === "rectangle" ? "rectangle" : "triangle",
          disabled: value.objects.length >= policy.maxObjects,
          run: () => add(shape, wheel.point),
        });
    if (!targets.length) return creation;
    const items: WheelItem[] = [];
    if (rotationPivot(value, targets))
      items.push({
        id: "rotate",
        label: t("scene2d.rotate"),
        icon: "rotate",
        run: () => {
          setRotating(true);
          setScaling(false);
        },
      });
    if (rotationPivot(value, targets))
      items.push({
        id: "scale",
        label: t("scene2d.scale"),
        icon: "scale",
        run: () => {
          setScaling(true);
          setRotating(false);
        },
      });
    if (kind === "edge" && sameKind)
      items.push(command("split", "lab2d.splitEdge", "split"));
    if (kind === "vertex" && sameKind && targets.length === 1)
      items.push({
        id: "extend",
        label: t("lab2d.extendVertex"),
        icon: "draw",
        run: () => {
          select(targets[0].objectId);
          setAnchor(targets[0].target!.id);
          setDrawing(true);
          setMode("vertex");
        },
      });
    if (kind === "vertex" && sameKind && targets.length === 2)
      items.push(command("connect", "scene2d.wheelConnect", "connect"));
    if (
      sameKind &&
      policy.createFaces &&
      ((kind === "vertex" && targets.length >= 3) ||
        (kind === "edge" && targets.length >= 2))
    )
      items.push(command("face", "lab2d.createFace", "face"));
    if (kind === "object" && sameKind && policy.createObjects)
      items.push(command("duplicate", "scene2d.duplicate", "duplicate"));
    const remove = command(
      "delete",
      kind === "edge"
        ? "scene2d.wheelKeepVertices"
        : kind === "face"
          ? "scene2d.wheelOnlyFaces"
          : "scene2d.wheelDelete",
      "delete",
    );
    if (kind === "edge" || kind === "face") {
      const children = [remove];
      if (kind === "face")
        children.push(
          command("deleteBoundary", "scene2d.wheelWithEdges", "boundary"),
        );
      children.push(
        command("deleteVertices", "scene2d.wheelWithVertices", "delete"),
      );
      items.push({
        id: "deleteMenu",
        label: t("scene2d.wheelDelete"),
        icon: "delete",
        children,
      });
    } else items.push(remove);
    if (creation.length)
      items.push({
        id: "addMenu",
        label: t("scene2d.wheelAdd"),
        icon: "add",
        children: creation,
      });
    return items;
  }
  const center = selected ? objectOrigin(selected) : null;
  const pivot = pivotFor(scaling ? "scale" : "rotate");
  return (
    <div className={styles.editor}>
      {wheel && (
        <SelectionWheel
          x={wheel.x}
          y={wheel.y}
          title={
            wheel.picks.length
              ? t("scene2d.selectionCount", { count: wheel.picks.length })
              : t("scene2d.wheelAdd")
          }
          items={wheelItems()}
          close={closeWheel}
        />
      )}
      <div className={styles.toolbar}>
        <div
          role="group"
          aria-label={t("scene2d.selectionMode")}
          className={styles.modes}
        >
          {policy.modes.map((item) => (
            <button
              key={item}
              aria-pressed={activeMode === item}
              aria-label={t(`scene2d.${item}`)}
              title={t(`scene2d.${item}`)}
              onClick={() => {
                cancel();
                setMode(item);
                setPicks([]);
                setSelection(null);
                setDrawing(false);
                setAnchor(null);
              }}
            >
              <LabIcon name={item} />
              <span className={styles.modeTooltip}>{t(`scene2d.${item}`)}</span>
            </button>
          ))}
        </div>
        <div className={styles.actions}>
          <button disabled={!canUndo} onClick={undo}>
            {t("scene2d.undo")}
          </button>
          <button disabled={!canRedo} onClick={redo}>
            {t("scene2d.redo")}
          </button>
          {policy.createObjects && (
            <>
              <button
                disabled={value.objects.length >= policy.maxObjects}
                onClick={() => add("rectangle")}
              >
                ＋ {t("scene2d.rectangle")}
              </button>
              <button
                disabled={value.objects.length >= policy.maxObjects}
                onClick={() => add("triangle")}
              >
                △ {t("scene2d.triangle")}
              </button>
              <button
                disabled={value.objects.length >= policy.maxObjects}
                onClick={() => add("empty")}
              >
                {t("scene2d.emptyObject")}
              </button>
            </>
          )}
        </div>
      </div>
      <div className={styles.workspace}>
        <aside className={styles.outliner} aria-label={t("scene2d.objects")}>
          <h2>
            {t("scene2d.objects")}{" "}
            <small>
              {value.objects.length}
              {Number.isFinite(policy.maxObjects)
                ? `/${policy.maxObjects}`
                : ""}
            </small>
          </h2>
          {!value.objects.length && <p>{t("scene2d.emptyScene")}</p>}
          {value.objects.map((object) => (
            <button
              key={object.id}
              aria-pressed={
                activeMode === "object"
                  ? isPicked({ objectId: object.id, target: null })
                  : selected?.id === object.id
              }
              onClick={(event) => {
                if (activeMode === "object")
                  choose(object.id, null, event.ctrlKey || event.metaKey);
                else select(object.id);
              }}
            >
              <span>◇ {object.name}</span>
              <small>
                {object.mesh.vertices.length} V · {object.mesh.edges.length} E ·{" "}
                {object.mesh.faces?.length ?? 0} F
              </small>
            </button>
          ))}
          {selected && (
            <div className={styles.properties}>
              <label>
                {t("scene2d.name")}
                <input
                  key={selected.id + selected.name}
                  maxLength={100}
                  defaultValue={selected.name}
                  onBlur={(event) => {
                    const name = event.target.value.trim();
                    if (name)
                      commit({
                        ...value,
                        objects: value.objects.map((object) =>
                          object.id === selected.id
                            ? { ...object, name }
                            : object,
                        ),
                      });
                    else event.target.value = selected.name;
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") event.currentTarget.blur();
                  }}
                />
              </label>
              <button
                disabled={
                  !policy.createObjects ||
                  value.objects.length >= policy.maxObjects
                }
                onClick={duplicate}
              >
                {t("scene2d.duplicate")}
              </button>
              <button
                onClick={() => {
                  commit({
                    ...value,
                    objects: value.objects.filter(
                      (object) => object.id !== selected.id,
                    ),
                  });
                  setPicks((p) =>
                    p.filter((item) => item.objectId !== selected.id),
                  );
                  select(null);
                }}
              >
                {t("scene2d.deleteObject")}
              </button>
              {center && activeMode === "object" && picks.length <= 1 && (
                <>
                  <Measure
                    label={t("scene2d.objectPositionX")}
                    value={center.x}
                    unit={measurements.unit}
                    step={measurements.step}
                    min={-policy.mesh.coordinateLimit}
                    max={policy.mesh.coordinateLimit}
                    onChange={(x) => nudge({ x: x - center.x, y: 0 })}
                  />
                  <Measure
                    label={t("scene2d.objectPositionY")}
                    value={center.y}
                    unit={measurements.unit}
                    step={measurements.step}
                    min={-policy.mesh.coordinateLimit}
                    max={policy.mesh.coordinateLimit}
                    onChange={(y) => nudge({ x: 0, y: y - center.y })}
                  />
                </>
              )}
            </div>
          )}
        </aside>
        <div className={styles.surface}>
          <>
            <div className={styles.viewTools}>
              <button
                aria-label={t("scene2d.scale")}
                title={t("scene2d.scale")}
                disabled={!pivot}
                aria-pressed={scaling}
                onClick={() => {
                  cancel();
                  setScaling((v) => !v);
                  setRotating(false);
                }}
              >
                <LabIcon name="scale" />
              </button>
              <button
                aria-label={t("scene2d.rotate")}
                title={t("scene2d.rotate")}
                disabled={!pivot}
                aria-pressed={rotating}
                onClick={() => {
                  cancel();
                  setRotating((v) => !v);
                  setScaling(false);
                }}
              >
                <LabIcon name="rotate" />
              </button>
              <button
                onClick={() => {
                  const rect = svg.current!.getBoundingClientRect();
                  openWheelAt(
                    rect.left + rect.width / 2,
                    rect.top + rect.height / 2,
                    validSceneSelections(value, picks),
                  );
                }}
              >
                {t("scene2d.wheelActions")}
              </button>
              <button
                aria-pressed={panTool}
                onClick={() => setPanTool((p) => !p)}
              >
                {t("scene2d.pan")}
              </button>
              <button
                onClick={() => {
                  setFrame(bounds(value));
                  setZoom(1);
                }}
              >
                {t("scene2d.fit")}
              </button>
              <button
                aria-label={t("lab2d.zoomOut")}
                onClick={() => setZoom((z) => Math.max(0.02, z / 1.4))}
              >
                −
              </button>
              <button
                aria-label={t("lab2d.zoomIn")}
                onClick={() => setZoom((z) => Math.min(200, z * 1.4))}
              >
                ＋
              </button>
            </div>
            <svg
              ref={svg}
              data-pan={panTool}
              onPointerEnter={() => {
                hovered.current = true;
              }}
              onPointerLeave={() => {
                hovered.current = false;
              }}
              tabIndex={0}
              onPointerDownCapture={startPan}
              onContextMenu={(event) => openWheel(event)}
              onDragStart={(event) => event.preventDefault()}
              onKeyUp={(event) => {
                if (event.code === "Space") spaceHeld.current = false;
              }}
              onBlur={() => {
                spaceHeld.current = false;
              }}
              className={styles.canvas}
              viewBox={`${view.x} ${view.y} ${size} ${size}`}
              role="img"
              aria-label={t("scene2d.canvas")}
              onPointerDown={(event) => {
                if (event.button !== 0) return;
                setWheel(null);
                if (event.target === event.currentTarget) {
                  if (drawing) appendPoint(point(event));
                  else {
                    setPicks([]);
                    select(null);
                    setSelection(null);
                  }
                }
              }}
              onPointerMove={(event) => {
                if (pivotDrag.current?.pointerId === event.pointerId) {
                  movePivot(point(event));
                  return;
                }
                const p = pan.current;
                if (p && p.pointerId === event.pointerId) {
                  setFrame((f) => ({
                    ...f,
                    centerX: p.centerX - (event.clientX - p.x) / p.scaleX,
                    centerY: p.centerY - (event.clientY - p.y) / p.scaleY,
                  }));
                  return;
                }
                queuePreview(event);
              }}
              onPointerUp={(event) => {
                if (pivotDrag.current) {
                  pivotDrag.current = null;
                  return;
                }
                stopPreview();
                if (pan.current) {
                  pan.current = null;
                  return;
                }
                if (!gesture.current) return;
                try {
                  const next = moved(event);
                  if (next) commit(next);
                } catch {
                  setError(true);
                }
                gesture.current = null;
                setFeedback({ degrees: null, factors: null });
                setDraft(null);
              }}
              onPointerCancel={cancel}
              onLostPointerCapture={() => {
                if (pivotDrag.current)
                  setTemporaryPivots(pivotDrag.current.previous);
                pivotDrag.current = null;
                stopPreview();
                pan.current = null;
                gesture.current = null;
                setFeedback({ degrees: null, factors: null });
                setDraft(null);
              }}
              onKeyDownCapture={(event) => {
                if (event.code === "Space") {
                  event.preventDefault();
                  event.stopPropagation();
                  spaceHeld.current = true;
                }
              }}
              onKeyDown={(event) => {
                if (
                  event.key === "ContextMenu" ||
                  (event.shiftKey && event.key === "F10")
                ) {
                  event.preventDefault();
                  const rect = (
                    event.target as SVGElement
                  ).getBoundingClientRect();
                  openWheelAt(
                    rect.left + rect.width / 2,
                    rect.top + rect.height / 2,
                    validSceneSelections(value, picks),
                  );
                }
                if (event.key === "Delete" || event.key === "Backspace") {
                  event.preventDefault();
                  runAction("delete", validSceneSelections(value, picks));
                }
                if (event.key.toLowerCase() === "f") {
                  event.preventDefault();
                  fillFace();
                }
                if (event.key === "Escape") {
                  setRotating(false);
                  setScaling(false);
                  cancel();
                  setDrawing(false);
                  setAnchor(null);
                }
              }}
            >
              <defs>
                <pattern
                  id={gridId}
                  width="0.5"
                  height="0.5"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M .5 0 H 0 V .5"
                    fill="none"
                    stroke="#cbd6df"
                    strokeWidth="0.01"
                  />
                </pattern>
              </defs>
              <rect
                x={view.x}
                y={view.y}
                width={size}
                height={size}
                fill={`url(#${gridId})`}
                pointerEvents="none"
              />
              <path
                d={`M ${view.x} 0 h ${size} M 0 ${view.y} v ${size}`}
                stroke="#9aaebe"
                strokeWidth="0.015"
                strokeDasharray=".1 .1"
                pointerEvents="none"
              />
              {scene.objects.map((object) => (
                <SceneGeometry
                  key={object.id}
                  object={object}
                  mode={drawing ? "vertex" : activeMode}
                  selections={picks
                    .filter((p) => p.objectId === object.id)
                    .map((p) => p.target)}
                  size={size}
                  begin={(event, target) => begin(event, object.id, target)}
                  contextMenu={(event, target) =>
                    openWheel(event, { objectId: object.id, target })
                  }
                  keyboard={(event, target) =>
                    keyboard(event, object.id, target)
                  }
                />
              ))}
              {(rotating || scaling) && pivot && (
                <TransformGizmo
                  tool={scaling ? "scale" : "rotate"}
                  pivot={pivot}
                  size={size}
                  degrees={feedback.degrees}
                  factors={feedback.factors}
                  onRotate={(event) => startRotation(event)}
                  onScale={startScale}
                  onPivot={startPivotDrag}
                  onNudgePivot={(delta) =>
                    movePivot({ x: pivot.x + delta.x, y: pivot.y + delta.y })
                  }
                  onStep={(direction, axis) =>
                    scaling
                      ? scaleBy({
                          x: axis === "y" ? 1 : 1 + direction * 0.1,
                          y: axis === "x" ? 1 : 1 + direction * 0.1,
                        })
                      : rotateBy(direction * 15)
                  }
                />
              )}
            </svg>
            <p className={styles.hint}>
              {t("scene2d.navigationHint")} ·{" "}
              {t("scene2d.selectionCount", { count: picks.length })}
              <span role="status">
                {error ? ` · ${t("scene2d.editFailed")}` : ""}
              </span>
            </p>
          </>
        </div>
        <div className={styles.details}>
          {pivot && (
            <fieldset className={styles.transformPanel}>
              <legend>{t("scene2d.scale")}</legend>
              <label>
                {t("scene2d.scaleXFactor")}
                <input
                  type="number"
                  step="0.1"
                  value={scaleX}
                  onChange={(e) => setScaleX(e.target.value)}
                />
              </label>
              <label>
                {t("scene2d.scaleYFactor")}
                <input
                  type="number"
                  step="0.1"
                  value={scaleY}
                  onChange={(e) => setScaleY(e.target.value)}
                />
              </label>
              <button
                disabled={
                  !scaleX.trim() ||
                  !scaleY.trim() ||
                  ![Number(scaleX), Number(scaleY)].every(Number.isFinite)
                }
                onClick={() =>
                  scaleBy({ x: Number(scaleX), y: Number(scaleY) })
                }
              >
                {t("scene2d.applyScale")}
              </button>
              {scaling && <p>{t("scene2d.scaleHint")}</p>}
            </fieldset>
          )}
          {(rotating || scaling) && pivot && (
            <>
              <p>{t("scene2d.pivotHint")}</p>
              <button
                onClick={() =>
                  setTemporaryPivots((current) => ({
                    ...current,
                    [scaling ? "scale" : "rotate"]: undefined,
                  }))
                }
              >
                {t("scene2d.resetPivot")}
              </button>
            </>
          )}

          {pivot && (
            <fieldset className={styles.transformPanel}>
              <legend>{t("scene2d.rotate")}</legend>
              <label>
                {t("scene2d.rotationAngle")}
                <input
                  type="number"
                  step="1"
                  value={angle}
                  onChange={(event) => setAngle(event.target.value)}
                />
              </label>
              <button
                disabled={!angle.trim() || !Number.isFinite(Number(angle))}
                onClick={() => rotateBy(Number(angle))}
              >
                {t("scene2d.applyRotation")}
              </button>
              <div className={styles.actions}>
                <button onClick={() => rotateBy(-90)}>−90°</button>
                <button onClick={() => rotateBy(90)}>+90°</button>
              </div>
              {rotating && <p>{t("scene2d.rotationHint")}</p>}
            </fieldset>
          )}
          {selected &&
            center &&
            activeMode === "object" &&
            picks.length === 1 && (
              <fieldset className={styles.transformPanel}>
                <legend>{t("scene2d.origin")}</legend>
                <p>{t("scene2d.originHint")}</p>
                <Measure
                  label={t("scene2d.originX")}
                  value={center.x}
                  unit={measurements.unit}
                  step={measurements.step}
                  min={-policy.mesh.coordinateLimit}
                  max={policy.mesh.coordinateLimit}
                  onChange={(x) => editOrigin({ x, y: center.y })}
                />
                <Measure
                  label={t("scene2d.originY")}
                  value={center.y}
                  unit={measurements.unit}
                  step={measurements.step}
                  min={-policy.mesh.coordinateLimit}
                  max={policy.mesh.coordinateLimit}
                  onChange={(y) => editOrigin({ x: center.x, y })}
                />
                <button
                  onClick={() => {
                    const b = meshBounds(selected.mesh);
                    editOrigin({ x: b.centerX, y: b.centerY });
                  }}
                >
                  {t("scene2d.centerOrigin")}
                </button>
              </fieldset>
            )}

          {picks.length > 1 ? (
            <p>{t("scene2d.multiHint", { count: picks.length })}</p>
          ) : selected && activeMode !== "object" ? (
            <>
              <button
                aria-pressed={drawing}
                onClick={() => {
                  cancel();
                  setDrawing(!drawing);
                  setMode("vertex");
                  setAnchor(selection?.kind === "vertex" ? selection.id : null);
                }}
              >
                {t("lab2d.drawEdges")}
              </button>
              {drawing && (
                <>
                  <p>{t("lab2d.drawHint")}</p>
                  <details>
                    <summary>{t("lab2d.addByCoordinates")}</summary>
                    <Measure
                      label={t("lab2d.positionX")}
                      value={newPoint.x}
                      unit={measurements.unit}
                      step={measurements.step}
                      min={-policy.mesh.coordinateLimit}
                      max={policy.mesh.coordinateLimit}
                      onChange={(x) => setNewPoint((p) => ({ ...p, x }))}
                    />
                    <Measure
                      label={t("lab2d.positionY")}
                      value={newPoint.y}
                      unit={measurements.unit}
                      step={measurements.step}
                      min={-policy.mesh.coordinateLimit}
                      max={policy.mesh.coordinateLimit}
                      onChange={(y) => setNewPoint((p) => ({ ...p, y }))}
                    />
                    <button onClick={() => appendPoint(newPoint)}>
                      {t("lab2d.addVertex")}
                    </button>
                  </details>
                </>
              )}
              <Inspector2D
                plan={selected.mesh}
                selection={selection}
                measurements={measurements}
                constraints={policy.mesh}
                commit={editMesh}
                setSelection={(target) => {
                  setSelection(target);
                  setPicks(target ? [{ objectId: selected.id, target }] : []);
                  if (target) setMode(target.kind);
                }}
                extend={(id) => {
                  setAnchor(id);
                  setDrawing(true);
                  setMode("vertex");
                }}
                onDeleteVertex={() => setAnchor(null)}
              />
              {policy.createFaces && (
                <details>
                  <summary>{t("lab2d.createFace")}</summary>
                  <p>{t("scene2d.facePicker")}</p>
                  {selected.mesh.vertices.map((v, index) => (
                    <label key={v.id}>
                      <input
                        type="checkbox"
                        checked={facePoints.includes(v.id)}
                        onChange={() =>
                          setFacePoints((ids) =>
                            ids.includes(v.id)
                              ? ids.filter((id) => id !== v.id)
                              : [...ids, v.id],
                          )
                        }
                      />
                      {t("lab2d.vertexNumber", { number: index + 1 })}
                      {facePoints.includes(v.id)
                        ? ` · ${facePoints.indexOf(v.id) + 1}`
                        : ""}
                    </label>
                  ))}
                  <button disabled={facePoints.length < 3} onClick={fillFace}>
                    {t("lab2d.fillFace")}
                  </button>
                </details>
              )}
            </>
          ) : (
            <p>{t("scene2d.objectHint")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
