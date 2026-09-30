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
  closedOutline,
  connectedEdges,
  outlineArea,
  moveVertex,
  blueprintBounds,
  validateBlueprint,
  edgeLength,
  type Blueprint,
  type BlueprintError,
  type BlueprintSelection,
  type Point,
} from "../model/blueprint";
import {
  formatArea,
  formatLength,
  snapCoordinate,
} from "../model/measurements";
import {
  defaultConstraints,
  type BlueprintConstraints,
} from "../model/blueprint";
import { defaultMeasurements, type Measurements } from "../model/measurements";
import Measure from "./Measure";
import BlueprintInspector from "./BlueprintInspector";
import styles from "./Blueprint.module.css";

/** Controlled editor: the host owns persistence, history and product-specific rules. */
export type BlueprintEditorProps = {
  /** Validated graph; changing the component key resets document-local view state. */
  value: Blueprint;
  /** Display unit and physical movement increment, independent of topology. */
  measurements?: Measurements;
  /** Product-specific geometry limits; defaults permit branches and crossings. */
  constraints?: BlueprintConstraints;
  /** Optional host fields; the editor never interprets their domain data. */
  sidebarContent?: ReactNode;
  /** Commits a valid edit once per gesture; persistence and history belong to the host. */
  onChange: (plan: Blueprint) => void;
  undo?: () => void;
  redo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
};
type Gesture = {
  kind: "move" | "draw";
  id: string;
  start: Point;
  plan: Blueprint;
  pointerId: number;
};

/** Edits a bounded vertex/edge graph with pointer gestures and equivalent form/list controls. */
export default function BlueprintEditor({
  value,
  measurements = defaultMeasurements,
  constraints = defaultConstraints,
  sidebarContent,
  onChange,
  undo,
  redo,
  canUndo,
  canRedo,
}: BlueprintEditorProps) {
  const { t, locale } = useI18n();
  const gridId = useId();
  const [selection, setSelection] = useState<BlueprintSelection>(null);
  const [tool, setTool] = useState<"select" | "draw">("select");
  const [anchor, setAnchor] = useState<string | null>(null);
  const [draft, setDraft] = useState<Blueprint | null>(null);
  const [cursor, setCursor] = useState<Point | null>(null);
  const [drawingFrom, setDrawingFrom] = useState<string | null>(null);
  const [newPoint, setNewPoint] = useState<Point>({ x: 0, y: 0 });
  const [error, setError] = useState<BlueprintError | null>(null);
  const [zoom, setZoom] = useState(1);
  const [frame, setFrame] = useState(() => blueprintBounds(value));
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
    t("blueprint.vertexNumber", {
      number: plan.vertices.findIndex((vertex) => vertex.id === id) + 1,
    });

  function commit(next: Blueprint): boolean {
    const problem = validateBlueprint(next, constraints);
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
    setSelection({ kind: "vertex", id });
    setError(null);
    gesture.current = {
      kind: tool === "draw" ? "draw" : "move",
      id,
      start: pointerPoint(event),
      plan: value,
      pointerId: event.pointerId,
    };
    if (tool === "draw") setDrawingFrom(id);
    svg.current?.setPointerCapture(event.pointerId);
  }

  function move(event: ReactPointerEvent<SVGSVGElement>) {
    const point = pointerPoint(event);
    setCursor(point);
    const active = gesture.current;
    if (!active || active.pointerId !== event.pointerId) return;
    if (active.kind === "move") {
      const original = active.plan.vertices.find(
        (vertex) => vertex.id === active.id,
      )!;
      const next = moveVertex(active.plan, active.id, {
        x: original.x + point.x - active.start.x,
        y: original.y + point.y - active.start.y,
      });
      setDraft(next);
      setError(validateBlueprint(next, constraints));
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
      if (draft) commit(draft);
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
            <p className={styles.eyebrow}>{t("blueprint.planMode")}</p>
            <h2>{t("blueprint.drawYourBlueprint")}</h2>
            <p>{t("blueprint.planInstructions")}</p>
            <button aria-pressed={tool === "select"} onClick={cancel}>
              ↖ {t("blueprint.selectMove")}
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
              ＋ {t("blueprint.drawEdges")}
            </button>
            <p className={styles.planHint}>
              {t(tool === "draw" ? "blueprint.drawHint" : "blueprint.moveHint")}
            </p>
            {tool === "draw" && (
              <details className={styles.coordinateEntry}>
                <summary>{t("blueprint.addByCoordinates")}</summary>
                <Measure
                  label={t("blueprint.positionX")}
                  value={newPoint.x}
                  min={-constraints.coordinateLimit}
                  max={constraints.coordinateLimit}
                  unit={measurements.unit}
                  step={measurements.step}
                  onChange={(x) => setNewPoint({ ...newPoint, x })}
                />
                <Measure
                  label={t("blueprint.positionY")}
                  value={newPoint.y}
                  min={-constraints.coordinateLimit}
                  max={constraints.coordinateLimit}
                  unit={measurements.unit}
                  step={measurements.step}
                  onChange={(y) => setNewPoint({ ...newPoint, y })}
                />
                <button onClick={() => addAt(newPoint)}>
                  {t("blueprint.addVertex")}
                </button>
              </details>
            )}
            {sidebarContent}
            <div className={styles.planState} data-closed={!!outline}>
              {t(outline ? "blueprint.planClosed" : "blueprint.planOpen")}
            </div>
            <p>
              {t("blueprint.planBounds", {
                count: constraints.maxVertices,
                limit: length(constraints.coordinateLimit),
                distance: length(constraints.minDistance),
                degree: constraints.maxDegree,
              })}
            </p>
            <button
              onClick={() => {
                if (window.confirm(t("blueprint.newPlanConfirm"))) {
                  onChange({ vertices: [], edges: [] });
                  setSelection(null);
                  setAnchor(null);
                  setTool("draw");
                  setDraft(null);
                  setError(null);
                }
              }}
            >
              {t("blueprint.newPlan")}
            </button>
          </div>
          <div className={styles.vertexList}>
            <h2>
              {t("blueprint.vertices")}{" "}
              <small>
                {plan.vertices.length}/{constraints.maxVertices}
              </small>
            </h2>
            {plan.vertices.map((vertex) => (
              <button
                key={vertex.id}
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
        </aside>
        <section
          className={`${styles.viewport} ${styles.planViewport}`}
          aria-label={t("blueprint.planCanvas")}
        >
          <div className={styles.toolbar}>
            <div>
              <button
                aria-label={t("blueprint.zoomOut")}
                onClick={() => setZoom((value) => Math.max(0.35, value / 1.25))}
              >
                −
              </button>
              <button
                aria-label={t("blueprint.zoomIn")}
                onClick={() => setZoom((value) => Math.min(3, value * 1.25))}
              >
                ＋
              </button>
              <button
                aria-label={t("blueprint.resetView")}
                onClick={() => {
                  setFrame(blueprintBounds(value));
                  setZoom(1);
                }}
              >
                ⌖
              </button>
            </div>
            <div>
              <button
                aria-label={t("blueprint.undo")}
                disabled={!canUndo || !!draft}
                onClick={() => {
                  cancel();
                  undo?.();
                }}
              >
                ↶
              </button>
              <button
                aria-label={t("blueprint.redo")}
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
            aria-label={t("blueprint.planCanvas")}
            onPointerMove={move}
            onPointerUp={finish}
            onPointerCancel={cancel}
            onKeyDown={(event) => {
              if (event.key === "Escape") cancel();
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
            {outline && (
              <polygon
                points={outline
                  .map((vertex) => `${vertex.x},${vertex.y}`)
                  .join(" ")}
                fill="var(--blueprint-fill, #dce8ef)"
                fillOpacity={0.25}
                pointerEvents="none"
              />
            )}

            {plan.edges.map((edge, index) => {
              const a = plan.vertices.find(
                  (vertex) => vertex.id === edge.start,
                )!,
                b = plan.vertices.find((vertex) => vertex.id === edge.end)!;
              const active =
                selectedEdge?.id === edge.id ||
                selectedVertex?.id === edge.start ||
                selectedVertex?.id === edge.end;
              const edgeLabel = t("blueprint.edgeNumber", {
                number: index + 1,
              });
              return (
                <g
                  key={edge.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${edgeLabel}: ${vertexName(a.id)} – ${vertexName(b.id)}, ${length(edgeLength(plan, edge))}`}
                  aria-pressed={selectedEdge?.id === edge.id}
                  className={styles.edgeHandle}
                  onPointerDown={(event) => {
                    event.stopPropagation();
                    setSelection({ kind: "edge", id: edge.id });
                  }}
                  onPointerUp={(event) => event.stopPropagation()}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelection({ kind: "edge", id: edge.id });
                    }
                  }}
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
                role="button"
                tabIndex={0}
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
                    selectedVertex?.id === vertex.id ? "#2876a2" : "#fffdf6"
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
              {t(`blueprint.planError.${error}`)}
            </p>
          )}
          <div className={styles.drawingBadge}>
            <span>{t("blueprint.planMode")}</span>
            <strong>
              {outlineArea(plan) === null
                ? t("blueprint.planOpenShort")
                : formatArea(outlineArea(plan)!, measurements.unit, locale)}
            </strong>
          </div>
          <div className={styles.viewportFooter}>
            <span>
              {t(tool === "draw" ? "blueprint.drawHint" : "blueprint.moveHint")}
            </span>
            <span>
              {t("blueprint.gridSpacing", {
                value: length(Math.max(0.1, measurements.step)),
              })}
            </span>
          </div>
        </section>
        <BlueprintInspector
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
