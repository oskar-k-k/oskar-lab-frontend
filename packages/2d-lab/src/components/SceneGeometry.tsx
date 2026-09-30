import type { KeyboardEvent, PointerEvent } from "react";
import { useI18n } from "@oskar-lab/i18n/I18nProvider";
import type { SceneObject, SelectionMode } from "../model/scene";
import { meshBounds, type MeshSelection } from "../model/mesh";
import styles from "./SceneEditor.module.css";

/** Draws one object's topology in a shared scene; only the active selection type receives input. */
export default function SceneGeometry({
  object,
  mode,
  selections,
  size,
  begin,
  keyboard,
}: {
  object: SceneObject;
  mode: SelectionMode;
  selections: MeshSelection[];
  size: number;
  begin: (event: PointerEvent<SVGElement>, selection: MeshSelection) => void;
  keyboard: (
    event: KeyboardEvent<SVGElement>,
    selection: MeshSelection,
  ) => void;
}) {
  const { t } = useI18n();
  const hit = (
    kind: SelectionMode,
    selection: MeshSelection,
    label: string,
  ) => ({
    role: mode === kind ? "button" : undefined,
    tabIndex: mode === kind ? 0 : undefined,
    "aria-label": mode === kind ? label : undefined,
    "aria-pressed":
      mode === kind
        ? selections.some(
            (s) => s?.kind === selection?.kind && s?.id === selection?.id,
          )
        : undefined,
    onPointerDown:
      mode === kind
        ? (event: PointerEvent<SVGElement>) => begin(event, selection)
        : undefined,
    onKeyDown:
      mode === kind
        ? (event: KeyboardEvent<SVGElement>) => keyboard(event, selection)
        : undefined,
  });
  const color = (kind: string, id: string) =>
    selections.some((selection) =>
      mode === "object"
        ? selection === null
        : selection?.kind === kind && selection.id === id,
    )
      ? "#147da6"
      : "#607f92";
  return (
    <g className={styles.object} {...hit("object", null, object.name)}>
      {(object.mesh.faces ?? []).map((face, index) => (
        <polygon
          key={face.id}
          {...hit(
            "face",
            { kind: "face", id: face.id },
            `${object.name} · ${t("lab2d.faceNumber", { number: index + 1 })}`,
          )}
          className={styles.geometryHandle}
          points={face.vertices
            .map((id) => {
              const v = object.mesh.vertices.find((v) => v.id === id)!;
              return `${v.x},${v.y}`;
            })
            .join(" ")}
          pointerEvents={mode === "object" || mode === "face" ? "auto" : "none"}
          fill={
            selections.some((selection) =>
              mode === "object"
                ? selection === null
                : selection?.kind === "face" && selection.id === face.id,
            )
              ? "#73bddc"
              : "#a8bacb"
          }
          fillOpacity=".55"
        />
      ))}
      {object.mesh.edges.map((edge, index) => {
        const a = object.mesh.vertices.find((v) => v.id === edge.start)!,
          b = object.mesh.vertices.find((v) => v.id === edge.end)!;
        return (
          <g
            key={edge.id}
            {...hit(
              "edge",
              { kind: "edge", id: edge.id },
              `${object.name} · ${t("lab2d.edgeNumber", { number: index + 1 })}`,
            )}
            className={styles.geometryHandle}
            pointerEvents={
              mode === "object" || mode === "edge" ? "auto" : "none"
            }
          >
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
              stroke={color("edge", edge.id)}
              strokeWidth={size / 300}
            />
          </g>
        );
      })}
      {object.mesh.vertices.map((vertex, index) => (
        <g
          key={vertex.id}
          className={styles.geometryHandle}
          {...hit(
            "vertex",
            { kind: "vertex", id: vertex.id },
            `${object.name} · ${t("lab2d.vertexNumber", { number: index + 1 })}`,
          )}
          pointerEvents={
            mode === "object" || mode === "vertex" ? "auto" : "none"
          }
        >
          {mode === "vertex" && (
            <circle
              cx={vertex.x}
              cy={vertex.y}
              r={size / 55}
              fill="transparent"
            />
          )}
          <circle
            cx={vertex.x}
            cy={vertex.y}
            r={mode === "vertex" ? size / 95 : size / 180}
            fill={color("vertex", vertex.id)}
            stroke="#fff"
            strokeWidth={size / 600}
          />
          {mode === "vertex" && (
            <text
              x={vertex.x}
              y={vertex.y - size / 50}
              textAnchor="middle"
              fontSize={size / 75}
              fill="#344e62"
              pointerEvents="none"
            >
              {index + 1}
            </text>
          )}
        </g>
      ))}
      {!!object.mesh.vertices.length && (
        <text
          x={meshBounds(object.mesh).centerX}
          y={meshBounds(object.mesh).minY - size / 35}
          textAnchor="middle"
          fontSize={size / 65}
          fill="#344e62"
          pointerEvents="none"
        >
          {object.name}
        </text>
      )}
    </g>
  );
}
