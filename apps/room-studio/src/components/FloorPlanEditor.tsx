"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useI18n } from "@oskar-lab/i18n/I18nProvider";
import {
  closedOutline,
  connectedWalls,
  floorArea,
  moveCorner,
  planBounds,
  splitWall,
  validatePlan,
  wallLength,
  type FloorPlan,
  type PlanError,
  type PlanSelection,
  type Point,
} from "../model/floorPlan";
import {
  formatArea,
  formatLength,
  snapCoordinate,
} from "../model/measurements";
import { furnitureFootprint, type Room } from "../model/room";
import Measure from "./Measure";
import styles from "./RoomStudio.module.css";

type Props = {
  room: Room;
  onChange: (plan: FloorPlan) => void;
  onHeight: (height: number) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
};
type Gesture = {
  kind: "move" | "draw";
  id: string;
  start: Point;
  plan: FloorPlan;
  pointerId: number;
};

/** Edits a bounded corner/edge graph with pointer gestures and equivalent form/list controls. */
export default function FloorPlanEditor({
  room,
  onChange,
  onHeight,
  undo,
  redo,
  canUndo,
  canRedo,
}: Props) {
  const { t, locale } = useI18n();
  const [selection, setSelection] = useState<PlanSelection>(null);
  const [tool, setTool] = useState<"select" | "draw">("select");
  const [anchor, setAnchor] = useState<string | null>(null);
  const [draft, setDraft] = useState<FloorPlan | null>(null);
  const [cursor, setCursor] = useState<Point | null>(null);
  const [drawingFrom, setDrawingFrom] = useState<string | null>(null);
  const [newPoint, setNewPoint] = useState<Point>({ x: 0, z: 0 });
  const [error, setError] = useState<PlanError | null>(null);
  const [zoom, setZoom] = useState(1);
  const [frame, setFrame] = useState(() => planBounds(room.plan));
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
  const plan = draft ?? room.plan;
  const outline = closedOutline(plan);
  const selectedCorner =
    selection?.kind === "corner"
      ? plan.corners.find((corner) => corner.id === selection.id)
      : undefined;
  const selectedWall =
    selection?.kind === "wall"
      ? plan.walls.find((wall) => wall.id === selection.id)
      : undefined;
  const startCorner = plan.corners.find((corner) => corner.id === anchor);
  const span = Math.max(frame.width, frame.depth, 4) + 3;
  const view = {
    x: frame.centerX - span / zoom / 2,
    z: frame.centerZ - span / zoom / 2,
    size: span / zoom,
  };
  const radius = (view.size * 13) / canvasSize;
  const length = (value: number) =>
    formatLength(value, room.measurements.unit, locale);
  const cornerName = (id: string) =>
    t("room.cornerNumber", {
      number: plan.corners.findIndex((corner) => corner.id === id) + 1,
    });

  function commit(next: FloorPlan): boolean {
    const problem = validatePlan(next);
    setError(problem);
    if (problem) return false;
    onChange(next);
    return true;
  }

  function pointerPoint(event: ReactPointerEvent<SVGElement>): Point {
    const matrix = svg.current?.getScreenCTM();
    if (!matrix) return { x: 0, z: 0 };
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(
      matrix.inverse(),
    );
    return {
      x: snapCoordinate(point.x, room.measurements),
      z: snapCoordinate(point.y, room.measurements),
    };
  }

  function connectTo(id: string, from = anchor) {
    if (
      !from ||
      from === id ||
      !plan.corners.some((corner) => corner.id === from)
    ) {
      if (connectedWalls(plan, id).length >= 2) {
        setError("connections");
        return;
      }
      setAnchor(id);
      setSelection({ kind: "corner", id });
      return;
    }
    const next = {
      ...room.plan,
      walls: [
        ...room.plan.walls,
        { id: crypto.randomUUID(), start: from, end: id },
      ],
    };
    if (commit(next)) {
      setSelection({ kind: "corner", id });
      const closed = closedOutline(next);
      setAnchor(closed || connectedWalls(next, id).length === 2 ? null : id);
      if (closed) setTool("select");
    }
  }

  function addAt(point: Point, from = anchor) {
    const nearby = plan.corners.find(
      (corner) =>
        Math.hypot(corner.x - point.x, corner.z - point.z) < radius * 1.6,
    );
    if (nearby) {
      connectTo(nearby.id, from);
      return;
    }
    const id = crypto.randomUUID();
    const next = {
      corners: [...room.plan.corners, { ...point, id }],
      walls:
        from && plan.corners.some((corner) => corner.id === from)
          ? [
              ...room.plan.walls,
              { id: crypto.randomUUID(), start: from, end: id },
            ]
          : room.plan.walls,
    };
    if (commit(next)) {
      setAnchor(id);
      setSelection({ kind: "corner", id });
    }
  }

  function beginCorner(event: ReactPointerEvent<SVGGElement>, id: string) {
    if (event.button !== 0 || !event.isPrimary) return;
    event.stopPropagation();
    if (tool === "draw" && connectedWalls(plan, id).length >= 2) {
      setError("connections");
      return;
    }
    setSelection({ kind: "corner", id });
    setError(null);
    gesture.current = {
      kind: tool === "draw" ? "draw" : "move",
      id,
      start: pointerPoint(event),
      plan: room.plan,
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
      const original = active.plan.corners.find(
        (corner) => corner.id === active.id,
      )!;
      const next = moveCorner(active.plan, active.id, {
        x: original.x + point.x - active.start.x,
        z: original.z + point.z - active.start.z,
      });
      setDraft(next);
      setError(validatePlan(next));
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
        Math.hypot(point.x - active.start.x, point.z - active.start.z) < 0.025
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
    setSelection({ kind: "corner", id });
    setError(null);
  }

  const activeAnchor = drawingFrom
    ? plan.corners.find((corner) => corner.id === drawingFrom)
    : startCorner;
  return (
    <>
      <aside className={styles.sidebar}>
        <div className={styles.planTools}>
          <p className={styles.eyebrow}>{t("room.planMode")}</p>
          <h2>{t("room.drawYourRoom")}</h2>
          <p>{t("room.planInstructions")}</p>
          <button aria-pressed={tool === "select"} onClick={cancel}>
            ↖ {t("room.selectMove")}
          </button>
          <button
            aria-pressed={tool === "draw"}
            onClick={() => {
              setTool("draw");
              setAnchor(
                selectedCorner &&
                  connectedWalls(plan, selectedCorner.id).length < 2
                  ? selectedCorner.id
                  : null,
              );
              setError(null);
            }}
          >
            ＋ {t("room.drawWalls")}
          </button>
          <p className={styles.planHint}>
            {t(tool === "draw" ? "room.drawHint" : "room.moveHint")}
          </p>
          {tool === "draw" && (
            <details className={styles.coordinateEntry}>
              <summary>{t("room.addByCoordinates")}</summary>
              <Measure
                label={t("room.positionX")}
                value={newPoint.x}
                min={-10}
                max={10}
                unit={room.measurements.unit}
                step={room.measurements.step}
                onChange={(x) => setNewPoint({ ...newPoint, x })}
              />
              <Measure
                label={t("room.positionZ")}
                value={newPoint.z}
                min={-10}
                max={10}
                unit={room.measurements.unit}
                step={room.measurements.step}
                onChange={(z) => setNewPoint({ ...newPoint, z })}
              />
              <button onClick={() => addAt(newPoint)}>
                {t("room.addCorner")}
              </button>
            </details>
          )}
          <Measure
            label={t("room.height")}
            value={room.height}
            min={2}
            max={6}
            unit={room.measurements.unit}
            step={room.measurements.step}
            onChange={onHeight}
          />
          <div className={styles.planState} data-closed={!!outline}>
            {t(outline ? "room.planClosed" : "room.planOpen")}
          </div>
          <p>{t("room.planBounds")}</p>
          <button
            onClick={() => {
              if (window.confirm(t("room.newPlanConfirm"))) {
                onChange({ corners: [], walls: [] });
                setSelection(null);
                setAnchor(null);
                setTool("draw");
                setDraft(null);
                setError(null);
              }
            }}
          >
            {t("room.newPlan")}
          </button>
        </div>
        <div className={styles.cornerList}>
          <h2>
            {t("room.corners")} <small>{plan.corners.length}/64</small>
          </h2>
          {plan.corners.map((corner) => (
            <button
              key={corner.id}
              aria-pressed={selectedCorner?.id === corner.id}
              onClick={() => {
                setSelection({ kind: "corner", id: corner.id });
                if (tool === "draw") connectTo(corner.id);
              }}
            >
              <span>◇ {cornerName(corner.id)}</span>
              <small>
                {length(corner.x)} · {length(corner.z)}
              </small>
            </button>
          ))}
        </div>
      </aside>
      <section
        className={`${styles.viewport} ${styles.planViewport}`}
        aria-label={t("room.planCanvas")}
      >
        <div className={styles.toolbar}>
          <div>
            <button
              aria-label={t("room.zoomOut")}
              onClick={() => setZoom((value) => Math.max(0.35, value / 1.25))}
            >
              −
            </button>
            <button
              aria-label={t("room.zoomIn")}
              onClick={() => setZoom((value) => Math.min(3, value * 1.25))}
            >
              ＋
            </button>
            <button
              aria-label={t("room.resetView")}
              onClick={() => {
                setFrame(planBounds(room.plan));
                setZoom(1);
              }}
            >
              ⌖
            </button>
          </div>
          <div>
            <button
              aria-label={t("room.undo")}
              disabled={!canUndo || !!draft}
              onClick={() => {
                cancel();
                undo();
              }}
            >
              ↶
            </button>
            <button
              aria-label={t("room.redo")}
              disabled={!canRedo || !!draft}
              onClick={() => {
                cancel();
                redo();
              }}
            >
              ↷
            </button>
          </div>
        </div>
        <svg
          ref={svg}
          className={styles.planSvg}
          viewBox={`${view.x} ${view.z} ${view.size} ${view.size}`}
          aria-label={t("room.planCanvas")}
          onPointerMove={move}
          onPointerUp={finish}
          onPointerCancel={cancel}
          onKeyDown={(event) => {
            if (event.key === "Escape") cancel();
          }}
        >
          <defs>
            <pattern
              id="plan-grid"
              width={Math.max(0.1, room.measurements.step)}
              height={Math.max(0.1, room.measurements.step)}
              patternUnits="userSpaceOnUse"
            >
              <path
                d={`M ${Math.max(0.1, room.measurements.step)} 0 H 0 V ${Math.max(0.1, room.measurements.step)}`}
                fill="none"
                stroke="#b9c3b0"
                strokeWidth={0.007}
              />
            </pattern>
          </defs>
          <rect
            x={view.x - view.size}
            y={view.z - view.size}
            width={view.size * 3}
            height={view.size * 3}
            fill="url(#plan-grid)"
          />
          <path
            d={`M -10 0 H 10 M 0 -10 V 10`}
            stroke="#93a187"
            strokeWidth={0.015}
            strokeDasharray=".08 .08"
            pointerEvents="none"
          />
          {outline && (
            <polygon
              points={outline
                .map((corner) => `${corner.x},${corner.z}`)
                .join(" ")}
              fill={room.floor}
              fillOpacity={0.25}
              pointerEvents="none"
            />
          )}
          {room.items.map((item) => (
            <polygon
              key={item.id}
              points={furnitureFootprint(item)
                .map((point) => `${point.x},${point.z}`)
                .join(" ")}
              fill={item.color}
              fillOpacity={0.16}
              stroke="#8d977f"
              strokeWidth={0.01}
              pointerEvents="none"
            />
          ))}
          {plan.walls.map((wall, index) => {
            const a = plan.corners.find((corner) => corner.id === wall.start)!,
              b = plan.corners.find((corner) => corner.id === wall.end)!;
            const active =
              selectedWall?.id === wall.id ||
              selectedCorner?.id === wall.start ||
              selectedCorner?.id === wall.end;
            const wallLabel = t("room.wallNumber", { number: index + 1 });
            return (
              <g
                key={wall.id}
                role="button"
                tabIndex={0}
                aria-label={`${wallLabel}: ${cornerName(a.id)} – ${cornerName(b.id)}, ${length(wallLength(plan, wall))}`}
                aria-pressed={selectedWall?.id === wall.id}
                className={styles.wallHandle}
                onPointerDown={(event) => {
                  event.stopPropagation();
                  setSelection({ kind: "wall", id: wall.id });
                }}
                onPointerUp={(event) => event.stopPropagation()}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelection({ kind: "wall", id: wall.id });
                  }
                }}
              >
                <line
                  x1={a.x}
                  y1={a.z}
                  x2={b.x}
                  y2={b.z}
                  stroke="transparent"
                  strokeWidth={radius * 3}
                />
                <line
                  x1={a.x}
                  y1={a.z}
                  x2={b.x}
                  y2={b.z}
                  stroke={
                    error && draft ? "#b75f4b" : active ? "#426b51" : "#66735e"
                  }
                  strokeWidth={active ? 0.09 : 0.065}
                />
                {active && (
                  <text
                    x={
                      (a.x + b.x) / 2 +
                      ((b.z - a.z) / Math.max(0.001, wallLength(plan, wall))) *
                        radius *
                        2.4
                    }
                    y={
                      (a.z + b.z) / 2 -
                      ((b.x - a.x) / Math.max(0.001, wallLength(plan, wall))) *
                        radius *
                        2.4
                    }
                    fontSize={radius * 1.6}
                    textAnchor="middle"
                    className={styles.dimensionLabel}
                  >
                    {length(wallLength(plan, wall))}
                  </text>
                )}
              </g>
            );
          })}
          {tool === "draw" && activeAnchor && cursor && (
            <line
              x1={activeAnchor.x}
              y1={activeAnchor.z}
              x2={cursor.x}
              y2={cursor.z}
              stroke="#426b51"
              strokeWidth={0.04}
              strokeDasharray=".1 .07"
              pointerEvents="none"
            />
          )}
          {plan.corners.map((corner, index) => (
            <g
              key={corner.id}
              className={styles.cornerHandle}
              role="button"
              tabIndex={0}
              aria-label={cornerName(corner.id)}
              aria-pressed={selectedCorner?.id === corner.id}
              onPointerDown={(event) => beginCorner(event, corner.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  if (tool === "draw") connectTo(corner.id);
                  else setSelection({ kind: "corner", id: corner.id });
                }
                const directions: Record<string, Point> = {
                  ArrowLeft: { x: -1, z: 0 },
                  ArrowRight: { x: 1, z: 0 },
                  ArrowUp: { x: 0, z: -1 },
                  ArrowDown: { x: 0, z: 1 },
                };
                const direction = directions[event.key];
                if (direction) {
                  event.preventDefault();
                  setSelection({ kind: "corner", id: corner.id });
                  commit(
                    moveCorner(room.plan, corner.id, {
                      x: corner.x + direction.x * room.measurements.step,
                      z: corner.z + direction.z * room.measurements.step,
                    }),
                  );
                }
              }}
            >
              <circle
                cx={corner.x}
                cy={corner.z}
                r={radius * 1.7}
                fill="transparent"
              />
              <circle
                cx={corner.x}
                cy={corner.z}
                r={radius}
                fill={selectedCorner?.id === corner.id ? "#426b51" : "#fffdf6"}
                stroke="#426b51"
                strokeWidth={0.025}
              />
              <text
                x={corner.x}
                y={corner.z}
                dy=".35em"
                fontSize={radius * 1.15}
                textAnchor="middle"
                fill={selectedCorner?.id === corner.id ? "white" : "#426b51"}
                pointerEvents="none"
              >
                {index + 1}
              </text>
            </g>
          ))}
        </svg>
        {error && (
          <p role="alert" className={styles.planError}>
            {t(`room.planError.${error}`)}
          </p>
        )}
        <div className={styles.roomBadge}>
          <span>{t("room.planMode")}</span>
          <strong>
            {floorArea(plan) === null
              ? t("room.planOpenShort")
              : formatArea(floorArea(plan)!, room.measurements.unit, locale)}
          </strong>
        </div>
        <div className={styles.viewportFooter}>
          <span>{t(tool === "draw" ? "room.drawHint" : "room.moveHint")}</span>
          <span>
            {t("room.gridSpacing", {
              value: length(Math.max(0.1, room.measurements.step)),
            })}
          </span>
        </div>
      </section>
      <aside className={`${styles.inspector} ${styles.planInspector}`}>
        <p className={styles.eyebrow}>{t("room.inspector")}</p>
        {selectedCorner ? (
          <>
            <h2>{cornerName(selectedCorner.id)}</h2>
            <p>{t("room.cornerHint")}</p>
            <div className={styles.measureGrid} key={selectedCorner.id}>
              <Measure
                label={t("room.positionX")}
                value={selectedCorner.x}
                min={-10}
                max={10}
                unit={room.measurements.unit}
                step={room.measurements.step}
                onChange={(x) =>
                  commit(
                    moveCorner(room.plan, selectedCorner.id, {
                      x,
                      z: selectedCorner.z,
                    }),
                  )
                }
              />
              <Measure
                label={t("room.positionZ")}
                value={selectedCorner.z}
                min={-10}
                max={10}
                unit={room.measurements.unit}
                step={room.measurements.step}
                onChange={(z) =>
                  commit(
                    moveCorner(room.plan, selectedCorner.id, {
                      x: selectedCorner.x,
                      z,
                    }),
                  )
                }
              />
            </div>
            <h2>{t("room.connectedWalls")}</h2>
            <div className={styles.connectedList}>
              {connectedWalls(plan, selectedCorner.id).map((wall) => (
                <button
                  key={wall.id}
                  onClick={() => setSelection({ kind: "wall", id: wall.id })}
                >
                  <span>
                    ↔{" "}
                    {cornerName(
                      wall.start === selectedCorner.id ? wall.end : wall.start,
                    )}
                  </span>
                  <strong>{length(wallLength(plan, wall))}</strong>
                </button>
              ))}
            </div>
            <button
              disabled={connectedWalls(plan, selectedCorner.id).length >= 2}
              onClick={() => extend(selectedCorner.id)}
            >
              {t("room.extendCorner")}
            </button>
            <button
              className={styles.removePlan}
              onClick={() => {
                if (
                  commit({
                    corners: plan.corners.filter(
                      (corner) => corner.id !== selectedCorner.id,
                    ),
                    walls: plan.walls.filter(
                      (wall) =>
                        wall.start !== selectedCorner.id &&
                        wall.end !== selectedCorner.id,
                    ),
                  })
                ) {
                  setSelection(null);
                  setAnchor(null);
                }
              }}
            >
              {t("room.deleteCorner")}
            </button>
          </>
        ) : selectedWall ? (
          <>
            <h2>
              {t("room.wallNumber", {
                number:
                  plan.walls.findIndex((wall) => wall.id === selectedWall.id) +
                  1,
              })}
            </h2>
            <p className={styles.wallLength}>
              {length(wallLength(plan, selectedWall))}
            </p>
            <div className={styles.connectedList}>
              {[selectedWall.start, selectedWall.end].map((id) => (
                <button
                  key={id}
                  onClick={() => setSelection({ kind: "corner", id })}
                >
                  ◇ {cornerName(id)}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                const id = crypto.randomUUID();
                if (
                  commit(
                    splitWall(plan, selectedWall.id, id, crypto.randomUUID()),
                  )
                )
                  setSelection({ kind: "corner", id });
              }}
            >
              {t("room.splitWall")}
            </button>
            <button
              className={styles.removePlan}
              onClick={() => {
                if (
                  commit({
                    ...plan,
                    walls: plan.walls.filter(
                      (wall) => wall.id !== selectedWall.id,
                    ),
                  })
                )
                  extend(selectedWall.start);
              }}
            >
              {t("room.deleteWall")}
            </button>
            <p>{t("room.deleteWallHint")}</p>
          </>
        ) : (
          <div className={styles.emptySelection}>
            <span>◇</span>
            <h2>{t("room.selectCorner")}</h2>
            <p>{t("room.cornerSelectionHint")}</p>
          </div>
        )}
      </aside>
    </>
  );
}
