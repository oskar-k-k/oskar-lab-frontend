import type { KeyboardEvent, PointerEvent } from "react";
import { useI18n } from "@oskar-lab/i18n/I18nProvider";
import type { Point } from "../model/mesh";

/** Rotation/scale overlay with live feedback and an independently draggable, temporary pivot. */
export default function TransformGizmo({
  tool,
  pivot,
  size,
  degrees,
  factors,
  onRotate,
  onScale,
  onPivot,
  onNudgePivot,
  onStep,
}: {
  tool: "rotate" | "scale";
  pivot: Point;
  size: number;
  degrees: number | null;
  factors: Point | null;
  onRotate: (event: PointerEvent<SVGElement>) => void;
  onScale: (event: PointerEvent<SVGElement>, axis: "x" | "y" | "xy") => void;
  onPivot: (event: PointerEvent<SVGElement>) => void;
  onNudgePivot: (delta: Point) => void;
  onStep: (direction: number, axis?: "x" | "y" | "xy") => void;
}) {
  const { t } = useI18n();
  const r = size * 0.14;
  const radians = ((degrees ?? 0) * Math.PI) / 180;
  const handle = {
    x: pivot.x + Math.sin(radians) * r,
    y: pivot.y - Math.cos(radians) * r,
  };
  const sweep =
    (Math.sign(degrees ?? 0) *
      Math.min(360, Math.abs(degrees ?? 0)) *
      Math.PI) /
    180;
  const sector = Array.from(
    { length: 65 },
    (_, i) =>
      `${pivot.x + Math.sin((sweep * i) / 64) * r},${pivot.y - Math.cos((sweep * i) / 64) * r}`,
  ).join(" ");
  const step = (event: KeyboardEvent<SVGElement>, axis?: "x" | "y" | "xy") => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      event.stopPropagation();
      onStep(event.key === "ArrowLeft" ? -1 : 1, axis);
    }
  };
  const labelStyle = {
    fontSize: size / 42,
    fill: "#713504",
    stroke: "#fff",
    strokeWidth: size / 180,
    paintOrder: "stroke" as const,
    fontWeight: 600,
    pointerEvents: "none" as const,
  };
  const scale = factors ?? { x: 1, y: 1 };
  return (
    <g>
      {tool === "rotate" ? (
        <>
          {degrees !== null && (
            <polygon
              points={`${pivot.x},${pivot.y} ${sector}`}
              fill="var(--scene-selected)"
              opacity=".22"
              pointerEvents="none"
            />
          )}
          <circle
            cx={pivot.x}
            cy={pivot.y}
            r={r}
            fill="none"
            stroke="var(--scene-selected)"
            strokeWidth={size / 400}
            pointerEvents="none"
          />
          <circle
            cx={pivot.x}
            cy={pivot.y}
            r={r}
            fill="none"
            stroke="transparent"
            strokeWidth={size / 35}
            role="button"
            aria-label={t("scene2d.rotateHandle")}
            tabIndex={0}
            onPointerDown={onRotate}
            onKeyDown={(event) => step(event)}
            style={{ cursor: "crosshair", outline: "none" }}
          />
          <line
            x1={pivot.x}
            y1={pivot.y}
            x2={handle.x}
            y2={handle.y}
            stroke="var(--scene-selected)"
            strokeWidth={size / 500}
            pointerEvents="none"
          />
          <circle
            cx={handle.x}
            cy={handle.y}
            r={size / 70}
            fill="var(--scene-selected)"
            stroke="white"
            strokeWidth={size / 500}
            pointerEvents="none"
          />
          {degrees !== null && (
            <text
              x={handle.x + size / 40}
              y={handle.y - size / 60}
              style={labelStyle}
            >{`${degrees.toFixed(1)}°`}</text>
          )}
        </>
      ) : (
        <>
          <line
            x1={pivot.x}
            y1={pivot.y}
            x2={pivot.x + r * scale.x}
            y2={pivot.y}
            stroke="#b83c37"
            strokeWidth={size / 300}
            pointerEvents="none"
          />
          <line
            x1={pivot.x}
            y1={pivot.y}
            x2={pivot.x}
            y2={pivot.y - r * scale.y}
            stroke="#256baa"
            strokeWidth={size / 300}
            pointerEvents="none"
          />
          {(["x", "y", "xy"] as const).map((axis) => {
            const x =
              pivot.x +
              (axis === "y" ? 0 : r * scale.x * (axis === "xy" ? 0.75 : 1));
            const y =
              pivot.y -
              (axis === "x" ? 0 : r * scale.y * (axis === "xy" ? 0.75 : 1));
            return (
              <g
                key={axis}
                role="button"
                tabIndex={0}
                aria-label={t(`scene2d.scale${axis}`)}
                onPointerDown={(event) => onScale(event, axis)}
                onKeyDown={(event) => step(event, axis)}
                style={{
                  cursor:
                    axis === "x"
                      ? "ew-resize"
                      : axis === "y"
                        ? "ns-resize"
                        : "nesw-resize",
                  outline: "none",
                }}
              >
                <rect
                  x={x - size / 45}
                  y={y - size / 45}
                  width={size / 22.5}
                  height={size / 22.5}
                  fill="transparent"
                />
                <rect
                  x={x - size / 100}
                  y={y - size / 100}
                  width={size / 50}
                  height={size / 50}
                  fill={
                    axis === "x"
                      ? "#b83c37"
                      : axis === "y"
                        ? "#256baa"
                        : "var(--scene-selected)"
                  }
                  stroke="white"
                  strokeWidth={size / 500}
                />
                <text x={x + size / 45} y={y} style={labelStyle}>
                  {axis.toUpperCase()}
                </text>
              </g>
            );
          })}
          {factors && (
            <text
              x={pivot.x}
              y={pivot.y + r + size / 25}
              textAnchor="middle"
              style={labelStyle}
            >{`X ${scale.x.toFixed(2)}× · Y ${scale.y.toFixed(2)}×`}</text>
          )}
        </>
      )}
      <g
        role="button"
        tabIndex={0}
        aria-label={t("scene2d.movePivot")}
        onPointerDown={onPivot}
        onKeyDown={(event) => {
          const delta = {
            ArrowLeft: { x: -size / 100, y: 0 },
            ArrowRight: { x: size / 100, y: 0 },
            ArrowUp: { x: 0, y: -size / 100 },
            ArrowDown: { x: 0, y: size / 100 },
          }[event.key];
          if (delta) {
            event.preventDefault();
            event.stopPropagation();
            onNudgePivot(delta);
          }
        }}
        style={{ cursor: "move", outline: "none" }}
      >
        <circle cx={pivot.x} cy={pivot.y} r={size / 40} fill="transparent" />
        <circle
          cx={pivot.x}
          cy={pivot.y}
          r={size / 100}
          fill="white"
          stroke="var(--scene-selected)"
          strokeWidth={size / 500}
        />
        <path
          d={`M ${pivot.x - size / 65} ${pivot.y} h ${size / 32.5} M ${pivot.x} ${pivot.y - size / 65} v ${size / 32.5}`}
          stroke="var(--scene-selected)"
          strokeWidth={size / 350}
          pointerEvents="none"
        />
      </g>
    </g>
  );
}
