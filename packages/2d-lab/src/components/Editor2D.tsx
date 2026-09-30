"use client";

import {
  useEffect,
  useId,
  type ReactNode,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useI18n } from "@oskar-lab/i18n/I18nProvider";
import {
  createFace,
  translateSelection,
  closedOutline,
  connectedEdges,
  outlineArea,
  moveVertex,
  meshBounds,
  validateMesh,
  edgeLength,
  type Mesh2D,
  type MeshError,
  type MeshSelection,
  type Point,
} from "../model/mesh";
import {
  formatArea,
  formatLength,
  snapCoordinate,
} from "../model/measurements";
import { defaultConstraints, type MeshConstraints } from "../model/mesh";
import { defaultMeasurements, type Measurements } from "../model/measurements";
import Measure from "./Measure";
import Inspector2D from "./Inspector2D";
import styles from "./Lab2D.module.css";

/** Controlled editor: the host owns persistence, history and product-specific rules. */
export type Editor2DProps = {
  /** Restricts hit testing to one topology type; all preserves the embedded editor behavior. */
  selectionMode?: "all" | "vertex" | "edge" | "face";
  /** Validated graph; changing the component key resets document-local view state. */
  value: Mesh2D;
  /** Display unit and physical movement increment, independent of topology. */
  measurements?: Measurements;
  /** Product-specific geometry limits; defaults permit branches and crossings. */
  constraints?: MeshConstraints;
  /** Optional host fields; the editor never interprets their domain data. */
  sidebarContent?: ReactNode;
  /** Consumers may restrict face creation while retaining movement of existing faces. */
  allowFaceCreation?: boolean;
  /** Commits a valid edit once per gesture; persistence and history belong to the host. */
  onChange: (plan: Mesh2D) => void;
  undo?: () => void;
  redo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
};
type Gesture = {
  kind: "move" | "draw";
  id: string;
  selection: NonNullable<MeshSelection>;
  start: Point;
  plan: Mesh2D;
  pointerId: number;
};

/** Edits a bounded vertex/edge graph with pointer gestures and equivalent form/list controls. */
export default function Editor2D({
  selectionMode = "all",
  value,
  measurements = defaultMeasurements,
  constraints = defaultConstraints,
  sidebarContent,
  allowFaceCreation = true,
  onChange,
  undo,
  redo,
  canUndo,
  canRedo,
}: Editor2DProps) {
  const { t, locale } = useI18n();
  const gridId = useId();
  const [faceVertices, setFaceVertices] = useState<string[]>([]);
  const [selection, setSelection] = useState<MeshSelection>(null);
  const [tool, setTool] = useState<"select" | "draw">("select");
  const [anchor, setAnchor] = useState<string | null>(null);
  const [draft, setDraft] = useState<Mesh2D | null>(null);
  const [cursor, setCursor] = useState<Point | null>(null);
  const [drawingFrom, setDrawingFrom] = useState<string | null>(null);
  const [newPoint, setNewPoint] = useState<Point>({ x: 0, y: 0 });
  const [error, setError] = useState<MeshError | null>(null);
  const [zoom, setZoom] = useState(1);
  const [frame, setFrame] = useState(() => meshBounds(value));
  const gesture = useRef<Gesture | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  const [canvasSize, setCanvasSize] = useState(650);
  useEffect(() => {
    const element = svg.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setCanvasSize(
        Math.max(
          1,
          Math.min(entry.contentRect.width, entry.contentRect.height),
        ),
      );
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const plan = draft ?? value;
  const outline = closedOutline(plan);
  const selectedVertex =
    selection?.kind === "vertex"
      ? plan.vertices.find((vertex) => vertex.id === selection.id)
      : undefined;
  const selectedEdge =
    selection?.kind === "edge"
      ? plan.edges.find((edge) => edge.id === selection.id)
      : undefined;
  const startVertex = plan.vertices.find((vertex) => vertex.id === anchor);
  const span = Math.max(frame.width, frame.height, 4) + 3;
  const view = {
    x: frame.centerX - span / zoom / 2,
    y: frame.centerY - span / zoom / 2,
    size: span / zoom,
  };
  const radius = (view.size * 13) / canvasSize;
  const length = (value: number) =>
    formatLength(value, measurements.unit, locale);
  const vertexName = (id: string) =>
    t("lab2d.vertexNumber", {
      number: plan.vertices.findIndex((vertex) => vertex.id === id) + 1,
    });

  function commit(next: Mesh2D): boolean {
    const problem = validateMesh(next, constraints);
    setError(problem);
    if (problem) return false;
    if (JSON.stringify(next) === JSON.stringify(value)) return true;
    onChange(next);
    return true;
  }

  function pointerPoint(event: ReactPointerEvent<SVGElement>): Point {
    const matrix = svg.current?.getScreenCTM();
    if (!matrix) return { x: 0, y: 0 };
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(
      matrix.inverse(),
    );
    return {
      x: snapCoordinate(point.x, measurements),
      y: snapCoordinate(point.y, measurements),
    };
  }

  function connectTo(id: string, from = anchor) {
    if (
      !from ||
      from === id ||
      !plan.vertices.some((vertex) => vertex.id === from)
    ) {
      if (connectedEdges(plan, id).length >= constraints.maxDegree) {
        setError("connections");
        return;
      }
      setAnchor(id);
      setSelection({ kind: "vertex", id });
      return;
    }
    const next = {
      ...value,
      edges: [
        ...value.edges,
        { id: crypto.randomUUID(), start: from, end: id },
      ],
    };
    if (commit(next)) {
      setSelection({ kind: "vertex", id });
      const closed = closedOutline(next);
      setAnchor(
        (closed && constraints.maxDegree === 2) ||
          connectedEdges(next, id).length >= constraints.maxDegree
          ? null
          : id,
      );
      if (closed && constraints.maxDegree === 2) setTool("select");
    }
  }

  function addAt(point: Point, from = anchor) {
    const nearby = plan.vertices.find(
      (vertex) =>
        Math.hypot(vertex.x - point.x, vertex.y - point.y) < radius * 1.6,
    );
    if (nearby) {
      connectTo(nearby.id, from);
      return;
    }
    const id = crypto.randomUUID();
    const next = {
      ...value,
      vertices: [...value.vertices, { ...point, id }],
      edges:
        from && plan.vertices.some((vertex) => vertex.id === from)
          ? [...value.edges, { id: crypto.randomUUID(), start: from, end: id }]
          : value.edges,
    };
    if (commit(next)) {
      setAnchor(id);
      setSelection({ kind: "vertex", id });
    }
  }

  function beginVertex(event: ReactPointerEvent<SVGGElement>, id: string) {
    if (event.button !== 0 || !event.isPrimary) return;
    event.stopPropagation();
    if (
      tool === "draw" &&
      connectedEdges(plan, id).length >= constraints.maxDegree
    ) {
      setError("connections");
      return;
    }
    if (event.shiftKey && allowFaceCreation) {
      setTool("select");
      toggleFaceVertex(id);
      setSelection({ kind: "vertex", id });
      return;
    }
    setSelection({ kind: "vertex", id });
    setError(null);
    gesture.current = {
      kind: tool === "draw" ? "draw" : "move",
      id,
      selection: { kind: "vertex", id },
      start: pointerPoint(event),
      plan: value,
      pointerId: event.pointerId,
    };
    if (tool === "draw") setDrawingFrom(id);
    svg.current?.setPointerCapture(event.pointerId);
  }

  function beginSelection(
    event: ReactPointerEvent<SVGElement>,
    selected: NonNullable<MeshSelection>,
  ) {
    if (
      event.button !== 0 ||
      !event.isPrimary ||
      (tool === "draw" && selected.kind === "face")
    )
      return;
    event.stopPropagation();
    setTool("select");
    setSelection(selected);
    setError(null);
    gesture.current = {
      kind: "move",
      id: selected.id,
      selection: selected,
      start: pointerPoint(event),
      plan: value,
      pointerId: event.pointerId,
    };
    svg.current?.setPointerCapture(event.pointerId);
  }
  function moveByKey(
    event: React.KeyboardEvent<SVGElement>,
    selected: NonNullable<MeshSelection>,
  ) {
    const directions: Record<string, Point> = {
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
    };
    const direction = directions[event.key];
    if (direction) {
      event.preventDefault();
      setSelection(selected);
      commit(
        translateSelection(value, selected, {
          x: direction.x * measurements.step,
          y: direction.y * measurements.step,
        }),
      );
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setSelection(selected);
    }
  }
  function toggleFaceVertex(id: string) {
    setFaceVertices((ids) =>
      ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id],
    );
  }
  function fillFace() {
    const ids = faceVertices.filter((id) =>
      value.vertices.some((v) => v.id === id),
    );
    if (!allowFaceCreation || ids.length < 3) return;
    const id = crypto.randomUUID();
    if (commit(createFace(value, ids, id))) {
      setSelection({ kind: "face", id });
      setFaceVertices([]);
      setTool("select");
    }
  }

  function move(event: ReactPointerEvent<SVGSVGElement>) {
    const point = pointerPoint(event);
    setCursor(point);
    const active = gesture.current;
    if (!active || active.pointerId !== event.pointerId) return;
    if (active.kind === "move") {
      const next = translateSelection(active.plan, active.selection, {
        x: point.x - active.start.x,
        y: point.y - active.start.y,
      });
      setDraft(next);
      setError(validateMesh(next, constraints));
    }
  }

  function finish(event: ReactPointerEvent<SVGSVGElement>) {
    const active = gesture.current;
    if (active && active.pointerId !== event.pointerId) return;
    gesture.current = null;
    setDrawingFrom(null);
    if (svg.current?.hasPointerCapture(event.pointerId))
      svg.current.releasePointerCapture(event.pointerId);
    if (active?.kind === "move") {
      const point = pointerPoint(event);
      commit(
        translateSelection(active.plan, active.selection, {
          x: point.x - active.start.x,
          y: point.y - active.start.y,
        }),
      );
      setDraft(null);
      return;
    }
    if (tool !== "draw") return;
    const point = pointerPoint(event);
    if (active?.kind === "draw") {
      if (
        Math.hypot(point.x - active.start.x, point.y - active.start.y) < 0.025
      )
        connectTo(active.id);
      else addAt(point, active.id);
    } else addAt(point);
  }

  function cancel() {
    const pointerId = gesture.current?.pointerId;
    if (pointerId !== undefined && svg.current?.hasPointerCapture(pointerId))
      svg.current.releasePointerCapture(pointerId);
    gesture.current = null;
    setDrawingFrom(null);
    setDraft(null);
    setCursor(null);
    setAnchor(null);
    setTool("select");
    setError(null);
  }

  function extend(id: string) {
    setTool("draw");
    setAnchor(id);
    setSelection({ kind: "vertex", id });
    setError(null);
  }

  const activeAnchor = drawingFrom
    ? plan.vertices.find((vertex) => vertex.id === drawingFrom)
    : startVertex;
  return (
    <div className={styles.container}>
      <div className={styles.editor}>
        <aside className={styles.sidebar}>
          <div className={styles.planTools}>
            <p className={styles.eyebrow}>{t("lab2d.planMode")}</p>
            <h2>{t("lab2d.drawTitle")}</h2>
            <p>{t("lab2d.planInstructions")}</p>
            <button aria-pressed={tool === "select"} onClick={cancel}>
              ↖ {t("lab2d.selectMove")}
            </button>
            <button
              aria-pressed={tool === "draw"}
              onClick={() => {
                setTool("draw");
                setAnchor(
                  selectedVertex &&
                    connectedEdges(plan, selectedVertex.id).length <
                      constraints.maxDegree
                    ? selectedVertex.id
                    : null,
                );
                setError(null);
              }}
            >
              ＋ {t("lab2d.drawEdges")}
            </button>
            <p className={styles.planHint}>
              {t(tool === "draw" ? "lab2d.drawHint" : "lab2d.moveHint")}
            </p>
            {tool === "draw" && (
              <details className={styles.coordinateEntry}>
                <summary>{t("lab2d.addByCoordinates")}</summary>
                <Measure
                  label={t("lab2d.positionX")}
                  value={newPoint.x}
                  min={-constraints.coordinateLimit}
                  max={constraints.coordinateLimit}
                  unit={measurements.unit}
                  step={measurements.step}
                  onChange={(x) => setNewPoint({ ...newPoint, x })}
                />
                <Measure
                  label={t("lab2d.positionY")}
                  value={newPoint.y}
                  min={-constraints.coordinateLimit}
                  max={constraints.coordinateLimit}
                  unit={measurements.unit}
                  step={measurements.step}
                  onChange={(y) => setNewPoint({ ...newPoint, y })}
                />
                <button onClick={() => addAt(newPoint)}>
                  {t("lab2d.addVertex")}
                </button>
              </details>
            )}
            {sidebarContent}
            <div
              className={styles.planState}
              data-closed={!!outline || !!plan.faces?.length}
            >
              {plan.faces?.length
                ? t("lab2d.faceCount", { count: plan.faces.length })
                : t(outline ? "lab2d.planClosed" : "lab2d.planOpen")}
            </div>
            <p>
              {t("lab2d.planBounds", {
                count: constraints.maxVertices,
                limit: length(constraints.coordinateLimit),
                distance: length(constraints.minDistance),
                degree: constraints.maxDegree,
              })}
            </p>
            <button
              onClick={() => {
                if (window.confirm(t("lab2d.newPlanConfirm"))) {
                  onChange({ vertices: [], edges: [], faces: [] });
                  setFaceVertices([]);
                  setSelection(null);
                  setAnchor(null);
                  setTool("draw");
                  setDraft(null);
                  setError(null);
                }
              }}
            >
              {t("lab2d.newPlan")}
            </button>
          </div>
          <div className={styles.vertexList}>
            <h2>
              {t("lab2d.vertices")}{" "}
              <small>
                {plan.vertices.length}/{constraints.maxVertices}
              </small>
            </h2>
            {plan.vertices.map((vertex) => (
              <button
                key={vertex.id}
                disabled={
                  selectionMode !== "all" &&
                  selectionMode !== "vertex" &&
                  tool !== "draw"
                }
                aria-pressed={selectedVertex?.id === vertex.id}
                onClick={() => {
                  setSelection({ kind: "vertex", id: vertex.id });
                  if (tool === "draw") connectTo(vertex.id);
                }}
              >
                <span>◇ {vertexName(vertex.id)}</span>
                <small>
                  {length(vertex.x)} · {length(vertex.y)}
                </small>
              </button>
            ))}
          </div>
          <div className={styles.vertexList}>
            <h2>
              {t("lab2d.faces")} <small>{(plan.faces ?? []).length}</small>
            </h2>
            {(plan.faces ?? []).map((face, index) => (
              <button
                key={face.id}
                disabled={selectionMode !== "all" && selectionMode !== "face"}
                aria-pressed={
                  selection?.kind === "face" && selection.id === face.id
                }
                onClick={() => setSelection({ kind: "face", id: face.id })}
              >
                {t("lab2d.faceNumber", { number: index + 1 })}
              </button>
            ))}
            {allowFaceCreation && (
              <details className={styles.faceCreator}>
                <summary>{t("lab2d.createFace")}</summary>
                <p>{t("lab2d.faceHint")}</p>
                {plan.vertices.map((vertex) => (
                  <label key={vertex.id}>
                    <input
                      type="checkbox"
                      checked={faceVertices.includes(vertex.id)}
                      onChange={() => toggleFaceVertex(vertex.id)}
                    />
                    {vertexName(vertex.id)}
                    {faceVertices.includes(vertex.id)
                      ? ` · ${faceVertices.indexOf(vertex.id) + 1}`
                      : ""}
                  </label>
                ))}
                <button
                  disabled={
                    faceVertices.filter((id) =>
                      plan.vertices.some((v) => v.id === id),
                    ).length < 3
                  }
                  onClick={fillFace}
                >
                  {t("lab2d.fillFace")}
                </button>
                <button
                  disabled={!faceVertices.length}
                  onClick={() => setFaceVertices([])}
                >
                  {t("lab2d.clearSelection")}
                </button>
              </details>
            )}
          </div>
        </aside>
        <section
          className={`${styles.viewport} ${styles.planViewport}`}
          aria-label={t("lab2d.planCanvas")}
        >
          <div className={styles.toolbar}>
            <div>
              <button
                aria-label={t("lab2d.zoomOut")}
                onClick={() => setZoom((value) => Math.max(0.35, value / 1.25))}
              >
                −
              </button>
              <button
                aria-label={t("lab2d.zoomIn")}
                onClick={() => setZoom((value) => Math.min(3, value * 1.25))}
              >
                ＋
              </button>
              <button
                aria-label={t("lab2d.resetView")}
                onClick={() => {
                  setFrame(meshBounds(value));
                  setZoom(1);
                }}
              >
                ⌖
              </button>
            </div>
            <div>
              <button
                aria-label={t("lab2d.undo")}
                disabled={!canUndo || !!draft}
                onClick={() => {
                  cancel();
                  undo?.();
                }}
              >
                ↶
              </button>
              <button
                aria-label={t("lab2d.redo")}
                disabled={!canRedo || !!draft}
                onClick={() => {
                  cancel();
                  redo?.();
                }}
              >
                ↷
              </button>
            </div>
          </div>
          <svg
            ref={svg}
            className={styles.planSvg}
            viewBox={`${view.x} ${view.y} ${view.size} ${view.size}`}
            aria-label={t("lab2d.planCanvas")}
            onPointerMove={move}
            onPointerUp={finish}
            onPointerCancel={cancel}
            onKeyDown={(event) => {
              if (event.key === "Escape") cancel();
              if (event.key.toLowerCase() === "f") {
                event.preventDefault();
                fillFace();
              }
            }}
          >
            <defs>
              <pattern
                id={gridId}
                width={Math.max(0.1, measurements.step)}
                height={Math.max(0.1, measurements.step)}
                patternUnits="userSpaceOnUse"
              >
                <path
                  d={`M ${Math.max(0.1, measurements.step)} 0 H 0 V ${Math.max(0.1, measurements.step)}`}
                  fill="none"
                  stroke="#bccfdb"
                  strokeWidth={0.007}
                />
              </pattern>
            </defs>
            <rect
              x={view.x - view.size}
              y={view.y - view.size}
              width={view.size * 3}
              height={view.size * 3}
              fill={`url(#${gridId})`}
            />
            <path
              d={`M ${view.x} 0 h ${view.size} M 0 ${view.y} v ${view.size}`}
              stroke="#8aa8bc"
              strokeWidth={0.015}
              strokeDasharray=".08 .08"
              pointerEvents="none"
            />
            {outline && !plan.faces?.length && (
              <polygon
                points={outline
                  .map((vertex) => `${vertex.x},${vertex.y}`)
                  .join(" ")}
                fill="var(--lab2d-fill, #dce8ef)"
                fillOpacity={0.25}
                pointerEvents="none"
              />
            )}

            {(plan.faces ?? []).map((face, index) => (
              <polygon
                key={face.id}
                points={face.vertices
                  .map((id) => {
                    const v = plan.vertices.find((v) => v.id === id)!;
                    return `${v.x},${v.y}`;
                  })
                  .join(" ")}
                fill={
                  selection?.kind === "face" && selection.id === face.id
                    ? "#71b9df"
                    : "#b3d4e7"
                }
                fillOpacity={0.55}
                className={styles.faceHandle}
                pointerEvents={
                  selectionMode === "all" || selectionMode === "face"
                    ? "auto"
                    : "none"
                }
                role="button"
                tabIndex={
                  selectionMode === "all" || selectionMode === "face" ? 0 : -1
                }
                aria-label={t("lab2d.faceNumber", { number: index + 1 })}
                aria-pressed={
                  selection?.kind === "face" && selection.id === face.id
                }
                onPointerDown={(event) =>
                  beginSelection(event, { kind: "face", id: face.id })
                }
                onKeyDown={(event) =>
                  moveByKey(event, { kind: "face", id: face.id })
                }
              />
            ))}
            {plan.edges.map((edge, index) => {
              const a = plan.vertices.find(
                  (vertex) => vertex.id === edge.start,
                )!,
                b = plan.vertices.find((vertex) => vertex.id === edge.end)!;
              const active =
                selectedEdge?.id === edge.id ||
                selectedVertex?.id === edge.start ||
                selectedVertex?.id === edge.end;
              const edgeLabel = t("lab2d.edgeNumber", {
                number: index + 1,
              });
              return (
                <g
                  key={edge.id}
                  pointerEvents={
                    selectionMode === "all" || selectionMode === "edge"
                      ? "auto"
                      : "none"
                  }
                  role="button"
                  tabIndex={
                    selectionMode === "all" || selectionMode === "edge" ? 0 : -1
                  }
                  aria-label={`${edgeLabel}: ${vertexName(a.id)} – ${vertexName(b.id)}, ${length(edgeLength(plan, edge))}`}
                  aria-pressed={selectedEdge?.id === edge.id}
                  className={styles.edgeHandle}
                  onPointerDown={(event) =>
                    beginSelection(event, { kind: "edge", id: edge.id })
                  }
                  onKeyDown={(event) =>
                    moveByKey(event, { kind: "edge", id: edge.id })
                  }
                >
                  <line
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke="transparent"
                    strokeWidth={radius * 3}
                  />
                  <line
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={
                      error && draft
                        ? "#b75f4b"
                        : active
                          ? "#2876a2"
                          : "#60859b"
                    }
                    strokeWidth={active ? 0.09 : 0.065}
                  />
                  {active && (
                    <text
                      x={
                        (a.x + b.x) / 2 +
                        ((b.y - a.y) /
                          Math.max(0.001, edgeLength(plan, edge))) *
                          radius *
                          2.4
                      }
                      y={
                        (a.y + b.y) / 2 -
                        ((b.x - a.x) /
                          Math.max(0.001, edgeLength(plan, edge))) *
                          radius *
                          2.4
                      }
                      fontSize={radius * 1.6}
                      textAnchor="middle"
                      className={styles.dimensionLabel}
                    >
                      {length(edgeLength(plan, edge))}
                    </text>
                  )}
                </g>
              );
            })}
            {tool === "draw" && activeAnchor && cursor && (
              <line
                x1={activeAnchor.x}
                y1={activeAnchor.y}
                x2={cursor.x}
                y2={cursor.y}
                stroke="#2876a2"
                strokeWidth={0.04}
                strokeDasharray=".1 .07"
                pointerEvents="none"
              />
            )}
            {plan.vertices.map((vertex, index) => (
              <g
                key={vertex.id}
                className={styles.vertexHandle}
                pointerEvents={
                  selectionMode === "all" ||
                  selectionMode === "vertex" ||
                  tool === "draw"
                    ? "auto"
                    : "none"
                }
                role="button"
                tabIndex={
                  selectionMode === "all" ||
                  selectionMode === "vertex" ||
                  tool === "draw"
                    ? 0
                    : -1
                }
                aria-label={vertexName(vertex.id)}
                aria-pressed={selectedVertex?.id === vertex.id}
                onPointerDown={(event) => beginVertex(event, vertex.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    if (tool === "draw") connectTo(vertex.id);
                    else setSelection({ kind: "vertex", id: vertex.id });
                  }
                  const directions: Record<string, Point> = {
                    ArrowLeft: { x: -1, y: 0 },
                    ArrowRight: { x: 1, y: 0 },
                    ArrowUp: { x: 0, y: -1 },
                    ArrowDown: { x: 0, y: 1 },
                  };
                  const direction = directions[event.key];
                  if (direction) {
                    event.preventDefault();
                    setSelection({ kind: "vertex", id: vertex.id });
                    commit(
                      moveVertex(value, vertex.id, {
                        x: vertex.x + direction.x * measurements.step,
                        y: vertex.y + direction.y * measurements.step,
                      }),
                    );
                  }
                }}
              >
                <circle
                  cx={vertex.x}
                  cy={vertex.y}
                  r={radius * 1.7}
                  fill="transparent"
                />
                <circle
                  cx={vertex.x}
                  cy={vertex.y}
                  r={radius}
                  fill={
                    selectedVertex?.id === vertex.id ||
                    faceVertices.includes(vertex.id)
                      ? "#2876a2"
                      : "#fffdf6"
                  }
                  stroke="#2876a2"
                  strokeWidth={0.025}
                />
                <text
                  x={vertex.x}
                  y={vertex.y}
                  dy=".35em"
                  fontSize={radius * 1.15}
                  textAnchor="middle"
                  fill={selectedVertex?.id === vertex.id ? "white" : "#2876a2"}
                  pointerEvents="none"
                >
                  {index + 1}
                </text>
              </g>
            ))}
          </svg>
          {error && (
            <p role="alert" className={styles.planError}>
              {t(`lab2d.planError.${error}`)}
            </p>
          )}
          <div className={styles.drawingBadge}>
            <span>{t("lab2d.planMode")}</span>
            <strong>
              {plan.faces?.length
                ? t("lab2d.faceCount", { count: plan.faces.length })
                : outlineArea(plan) === null
                  ? t("lab2d.planOpenShort")
                  : formatArea(outlineArea(plan)!, measurements.unit, locale)}
            </strong>
          </div>
          <div className={styles.viewportFooter}>
            <span>
              {t(tool === "draw" ? "lab2d.drawHint" : "lab2d.moveHint")}
            </span>
            <span>
              {t("lab2d.gridSpacing", {
                value: length(Math.max(0.1, measurements.step)),
              })}
            </span>
          </div>
        </section>
        <Inspector2D
          plan={plan}
          selection={selection}
          measurements={measurements}
          constraints={constraints}
          commit={commit}
          setSelection={setSelection}
          extend={extend}
          onDeleteVertex={() => setAnchor(null)}
        />
      </div>
    </div>
  );
}
