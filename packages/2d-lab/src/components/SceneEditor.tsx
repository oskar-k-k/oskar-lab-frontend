"use client";

import { useId, useRef, useState, type PointerEvent } from "react";
import { useI18n } from "@oskar-lab/i18n/I18nProvider";
import {
  addObject,
  defaultEnginePolicy,
  moveObject,
  parseScene,
  replaceObjectMesh,
  type EnginePolicy,
  type Scene2D,
  type SelectionMode,
} from "../model/scene";
import { meshBounds, type Point } from "../model/mesh";
import {
  defaultMeasurements,
  snapCoordinate,
  type Measurements,
} from "../model/measurements";
import Editor2D from "./Editor2D";
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

  function select(id: string | null) {
    setSelectedId(id);
    onEvent?.({ type: "selection", objectId: id });
  }
  function commit(next: Scene2D) {
    try {
      const validated = parseScene(next, policy);
      setError(false);
      if (JSON.stringify(validated) === JSON.stringify(value)) return;
      onChange(validated);
      onEvent?.({ type: "change", scene: validated });
    } catch {
      setError(true);
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
    return moveObject(
      current.scene,
      current.id,
      {
        x: snap(target.x - current.start.x),
        y: snap(target.y - current.start.y),
      },
      policy,
    );
  }
  function cancel() {
    gesture.current = null;
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
              aria-pressed={selected?.id === object.id}
              onClick={() => select(object.id)}
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
                  select(null);
                }}
              >
                {t("scene2d.deleteObject")}
              </button>
              {center && activeMode === "object" && (
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
          {activeMode === "object" ? (
            <>
              <div className={styles.viewTools}>
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
                  onClick={() => setZoom((z) => Math.max(0.1, z / 1.4))}
                >
                  −
                </button>
                <button
                  aria-label={t("lab2d.zoomIn")}
                  onClick={() => setZoom((z) => Math.min(20, z * 1.4))}
                >
                  ＋
                </button>
              </div>
              <svg
                ref={svg}
                className={styles.canvas}
                viewBox={`${view.x} ${view.y} ${size} ${size}`}
                role="img"
                aria-label={t("scene2d.canvas")}
                onPointerDown={(event) => {
                  if (event.target === event.currentTarget) select(null);
                }}
                onPointerMove={(event) => {
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
                  gesture.current = null;
                  setDraft(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") cancel();
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
                  <g
                    key={object.id}
                    role="button"
                    tabIndex={0}
                    aria-label={object.name}
                    aria-pressed={selected?.id === object.id}
                    className={styles.object}
                    onPointerDown={(event) => {
                      if (event.button !== 0 || !event.isPrimary) return;
                      event.stopPropagation();
                      select(object.id);
                      gesture.current = {
                        scene: value,
                        id: object.id,
                        start: point(event),
                        pointerId: event.pointerId,
                      };
                      svg.current?.setPointerCapture(event.pointerId);
                    }}
                    onKeyDown={(event) => {
                      const directions: Record<string, Point> = {
                        ArrowLeft: { x: -measurements.step, y: 0 },
                        ArrowRight: { x: measurements.step, y: 0 },
                        ArrowUp: { x: 0, y: -measurements.step },
                        ArrowDown: { x: 0, y: measurements.step },
                      };
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        select(object.id);
                      }
                      if (directions[event.key]) {
                        event.preventDefault();
                        select(object.id);
                        try {
                          commit(
                            moveObject(
                              value,
                              object.id,
                              directions[event.key],
                              policy,
                            ),
                          );
                        } catch {
                          setError(true);
                        }
                      }
                    }}
                  >
                    {(object.mesh.faces ?? []).map((face) => (
                      <polygon
                        key={face.id}
                        points={face.vertices
                          .map((id) => {
                            const v = object.mesh.vertices.find(
                              (v) => v.id === id,
                            )!;
                            return `${v.x},${v.y}`;
                          })
                          .join(" ")}
                        fill={
                          selected?.id === object.id ? "#73bddc" : "#a8bacb"
                        }
                        fillOpacity="0.55"
                      />
                    ))}
                    {object.mesh.edges.map((edge) => {
                      const a = object.mesh.vertices.find(
                          (v) => v.id === edge.start,
                        )!,
                        b = object.mesh.vertices.find(
                          (v) => v.id === edge.end,
                        )!;
                      return (
                        <g key={edge.id}>
                          <line
                            x1={a.x}
                            y1={a.y}
                            x2={b.x}
                            y2={b.y}
                            stroke="transparent"
                            strokeWidth={size / 40}
                          />
                          <line
                            x1={a.x}
                            y1={a.y}
                            x2={b.x}
                            y2={b.y}
                            stroke={
                              selected?.id === object.id ? "#147da6" : "#526b80"
                            }
                            strokeWidth={size / 300}
                          />
                        </g>
                      );
                    })}
                    {object.mesh.vertices.map((vertex) => (
                      <circle
                        key={vertex.id}
                        cx={vertex.x}
                        cy={vertex.y}
                        r={size / 180}
                        fill={
                          selected?.id === object.id ? "#147da6" : "#526b80"
                        }
                      />
                    ))}
                    {!!object.mesh.vertices.length && (
                      <text
                        x={meshBounds(object.mesh).centerX}
                        y={meshBounds(object.mesh).minY - size / 45}
                        textAnchor="middle"
                        fontSize={size / 65}
                        fill="#344e62"
                      >
                        {object.name}
                      </text>
                    )}
                  </g>
                ))}
              </svg>
              <p className={styles.hint}>{t("scene2d.objectHint")}</p>
            </>
          ) : selected ? (
            <>
              <p className={styles.hint}>
                {t("scene2d.editing", { name: selected.name })}
              </p>
              <Editor2D
                key={`${selected.id}-${activeMode}`}
                value={selected.mesh}
                selectionMode={activeMode}
                measurements={measurements}
                constraints={policy.mesh}
                allowFaceCreation={policy.createFaces}
                onChange={(mesh) => {
                  try {
                    commit(replaceObjectMesh(value, selected.id, mesh, policy));
                  } catch {
                    setError(true);
                  }
                }}
                undo={undo}
                redo={redo}
                canUndo={canUndo}
                canRedo={canRedo}
              />
            </>
          ) : (
            <p className={styles.empty}>{t("scene2d.selectObject")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
