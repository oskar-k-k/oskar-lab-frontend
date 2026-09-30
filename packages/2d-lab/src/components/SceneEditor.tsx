"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent,
  type KeyboardEvent,
} from "react";
import { useI18n } from "@oskar-lab/i18n/I18nProvider";
import {
  addObject,
  defaultEnginePolicy,
  moveObject,
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
    vertices: scene.objects.flatMap((object) => object.mesh.vertices),
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
  const gesture = useRef<{
    scene: Scene2D;
    id: string;
    start: Point;
    pointerId: number;
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
      if (!(event instanceof globalThis.KeyboardEvent) || event.code === "Space") spaceHeld.current = false;
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
      event.button === 2 ||
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
  function add(shape: "rectangle" | "triangle" | "empty") {
    try {
      const id = crypto.randomUUID();
      const next = addObject(
        value,
        id,
        t("scene2d.objectNumber", { number: value.objects.length + 1 }),
        shape,
        policy,
      );
      commit(next);
      select(id);
      setPicks(activeMode === "object" ? [{objectId:id,target:null}] : []);
      if (shape === "empty" && policy.modes.includes("vertex"))
        setMode("vertex");
    } catch {
      setError(true);
    }
  }
  function point(event: PointerEvent): Point {
    const matrix = svg.current?.getScreenCTM();
    if (!matrix) return { x: 0, y: 0 };
    const result = new DOMPoint(event.clientX, event.clientY).matrixTransform(
      matrix.inverse(),
    );
    return { x: result.x, y: result.y };
  }
  function moved(event: PointerEvent) {
    const current = gesture.current;
    if (!current || current.pointerId !== event.pointerId) return null;
    const target = point(event);
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
            x: snapCoordinate(position.x, measurements),
            y: snapCoordinate(position.y, measurements),
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
    event.stopPropagation();
    if (drawing && target?.kind === "vertex" && objectId === selectedId) {
      appendPoint(point(event), target.id);
      return;
    }
    event.preventDefault();
    event.currentTarget.focus();
    const selections = choose(objectId, target, event.ctrlKey || event.metaKey);
    if (event.ctrlKey || event.metaKey) return;
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

  function cancel() {
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
      setPicks(activeMode === "object" ? [{objectId:id,target:null}] : []);
    } catch {
      setError(true);
    }
  }
  const center = selected ? meshBounds(selected.mesh) : null;
  return (
    <div className={styles.editor}>
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
              onClick={() => {
                cancel();
                setMode(item);
                setPicks([]);
                setSelection(null);
                setDrawing(false);
                setAnchor(null);
              }}
            >
              {t(`scene2d.${item}`)}
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
      {error && (
        <p role="alert" className={styles.error}>
          {t("scene2d.invalidEdit")}
        </p>
      )}
      <div className={styles.workspace}>
        <aside className={styles.outliner} aria-label={t("scene2d.objects")}>
          <h2>
            {t("scene2d.objects")}{" "}
            <small>
              {value.objects.length}/{policy.maxObjects}
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
                  onKeyDownCapture={(event) => {
                    if (event.code === "Space") {
                      event.preventDefault();
                      event.stopPropagation();
                      spaceHeld.current = true;
                    }
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
                  setPicks(p=>p.filter(item=>item.objectId!==selected.id));
                  select(null);
                }}
              >
                {t("scene2d.deleteObject")}
              </button>
              {center && activeMode === "object" && picks.length <= 1 && (
                <>
                  <Measure
                    label={t("lab2d.centerX")}
                    value={center.centerX}
                    unit={measurements.unit}
                    step={measurements.step}
                    min={-policy.mesh.coordinateLimit}
                    max={policy.mesh.coordinateLimit}
                    onChange={(x) => nudge({ x: x - center.centerX, y: 0 })}
                  />
                  <Measure
                    label={t("lab2d.centerY")}
                    value={center.centerY}
                    unit={measurements.unit}
                    step={measurements.step}
                    min={-policy.mesh.coordinateLimit}
                    max={policy.mesh.coordinateLimit}
                    onChange={(y) => nudge({ x: 0, y: y - center.centerY })}
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
              onContextMenu={(event) => event.preventDefault()}
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
                const p = pan.current;
                if (p && p.pointerId === event.pointerId) {
                  setFrame((f) => ({
                    ...f,
                    centerX: p.centerX - (event.clientX - p.x) / p.scaleX,
                    centerY: p.centerY - (event.clientY - p.y) / p.scaleY,
                  }));
                  return;
                }
                try {
                  const next = moved(event);
                  if (next) {
                    setDraft(next);
                    setError(false);
                  }
                } catch {
                  setError(true);
                }
              }}
              onPointerUp={(event) => {
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
                setDraft(null);
              }}
              onPointerCancel={cancel}
              onLostPointerCapture={() => {
                pan.current = null;
                gesture.current = null;
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
                if (event.key.toLowerCase() === "f") {
                  event.preventDefault();
                  fillFace();
                }
                if (event.key === "Escape") {
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
                  keyboard={(event, target) =>
                    keyboard(event, object.id, target)
                  }
                />
              ))}
            </svg>
            <p className={styles.hint}>
              {t("scene2d.navigationHint")} ·{" "}
              {t("scene2d.selectionCount", { count: picks.length })}
            </p>
          </>
        </div>
        <div className={styles.details}>
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
