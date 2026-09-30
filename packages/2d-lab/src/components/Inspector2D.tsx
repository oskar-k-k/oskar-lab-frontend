"use client";
import { useI18n } from "@oskar-lab/i18n/I18nProvider";
import {
  deleteSelection,
  faceArea,
  selectionCenter,
  translateSelection,
  connectedEdges,
  edgeLength,
  moveVertex,
  splitEdge,
  type Mesh2D,
  type MeshSelection,
  type MeshConstraints,
} from "../model/mesh";
import {
  formatArea,
  formatLength,
  type Measurements,
} from "../model/measurements";
import Measure from "./Measure";
import styles from "./Lab2D.module.css";

/** Shows exact coordinates and topology actions for the current selection. */
export default function Inspector2D({
  plan,
  selection,
  measurements,
  constraints,
  commit,
  setSelection,
  extend,
  onDeleteVertex,
}: {
  plan: Mesh2D;
  selection: MeshSelection;
  measurements: Measurements;
  constraints: MeshConstraints;
  commit: (plan: Mesh2D) => boolean;
  setSelection: (selection: MeshSelection) => void;
  extend: (id: string) => void;
  onDeleteVertex: () => void;
}) {
  const { t, locale } = useI18n();
  const selectedVertex =
    selection?.kind === "vertex"
      ? plan.vertices.find((v) => v.id === selection.id)
      : undefined;
  const selectedEdge =
    selection?.kind === "edge"
      ? plan.edges.find((e) => e.id === selection.id)
      : undefined;
  const selectedFace =
    selection?.kind === "face"
      ? plan.faces?.find((face) => face.id === selection.id)
      : undefined;
  const center = selectionCenter(plan, selection);
  const length = (value: number) =>
    formatLength(value, measurements.unit, locale);
  const vertexName = (id: string) =>
    t("lab2d.vertexNumber", {
      number: plan.vertices.findIndex((v) => v.id === id) + 1,
    });
  return (
    <aside className={`${styles.inspector} ${styles.planInspector}`}>
      <p className={styles.eyebrow}>{t("lab2d.inspector")}</p>
      {selectedVertex ? (
        <>
          <h2>{vertexName(selectedVertex.id)}</h2>
          <p>{t("lab2d.vertexHint")}</p>
          <div className={styles.measureGrid} key={selectedVertex.id}>
            <Measure
              label={t("lab2d.positionX")}
              value={selectedVertex.x}
              min={-constraints.coordinateLimit}
              max={constraints.coordinateLimit}
              unit={measurements.unit}
              step={measurements.step}
              onChange={(x) =>
                commit(
                  moveVertex(plan, selectedVertex.id, {
                    x,
                    y: selectedVertex.y,
                  }),
                )
              }
            />
            <Measure
              label={t("lab2d.positionY")}
              value={selectedVertex.y}
              min={-constraints.coordinateLimit}
              max={constraints.coordinateLimit}
              unit={measurements.unit}
              step={measurements.step}
              onChange={(y) =>
                commit(
                  moveVertex(plan, selectedVertex.id, {
                    x: selectedVertex.x,
                    y,
                  }),
                )
              }
            />
          </div>
          <h2>{t("lab2d.connectedEdges")}</h2>
          <div className={styles.connectedList}>
            {connectedEdges(plan, selectedVertex.id).map((edge) => (
              <button
                key={edge.id}
                onClick={() => setSelection({ kind: "edge", id: edge.id })}
              >
                <span>
                  ↔{" "}
                  {vertexName(
                    edge.start === selectedVertex.id ? edge.end : edge.start,
                  )}
                </span>
                <strong>{length(edgeLength(plan, edge))}</strong>
              </button>
            ))}
          </div>
          <button
            disabled={
              connectedEdges(plan, selectedVertex.id).length >=
              constraints.maxDegree
            }
            onClick={() => extend(selectedVertex.id)}
          >
            {t("lab2d.extendVertex")}
          </button>
          <button
            className={styles.removePlan}
            onClick={() => {
              if (commit(deleteSelection(plan, selection))) {
                setSelection(null);
                onDeleteVertex();
              }
            }}
          >
            {t("lab2d.deleteVertex")}
          </button>
        </>
      ) : selectedEdge ? (
        <>
          <h2>
            {t("lab2d.edgeNumber", {
              number:
                plan.edges.findIndex((edge) => edge.id === selectedEdge.id) + 1,
            })}
          </h2>
          <p className={styles.edgeLength}>
            {length(edgeLength(plan, selectedEdge))}
          </p>
          <div className={styles.connectedList}>
            {[selectedEdge.start, selectedEdge.end].map((id) => (
              <button
                key={id}
                onClick={() => setSelection({ kind: "vertex", id })}
              >
                ◇ {vertexName(id)}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              const id = crypto.randomUUID();
              if (
                commit(
                  splitEdge(plan, selectedEdge.id, id, crypto.randomUUID()),
                )
              )
                setSelection({ kind: "vertex", id });
            }}
          >
            {t("lab2d.splitEdge")}
          </button>
          <button
            className={styles.removePlan}
            onClick={() => {
              if (commit(deleteSelection(plan, selection)))
                extend(selectedEdge.start);
            }}
          >
            {t("lab2d.deleteEdge")}
          </button>
          <p>{t("lab2d.deleteEdgeHint")}</p>
        </>
      ) : selectedFace ? (
        <>
          <h2>
            {t("lab2d.faceNumber", {
              number:
                (plan.faces ?? []).findIndex((f) => f.id === selectedFace.id) +
                1,
            })}
          </h2>
          <p>
            {formatArea(
              faceArea(plan, selectedFace),
              measurements.unit,
              locale,
            )}
          </p>
          <p>{t("lab2d.faceMoveHint")}</p>
          <button
            onClick={() => {
              if (commit(deleteSelection(plan, selection))) setSelection(null);
            }}
          >
            {t("lab2d.deleteFace")}
          </button>
        </>
      ) : (
        <div className={styles.emptySelection}>
          <span>◇</span>
          <h2>{t("lab2d.selectVertex")}</h2>
          <p>{t("lab2d.vertexSelectionHint")}</p>
        </div>
      )}
      {(selectedEdge || selectedFace) && (
        <div className={styles.measureGrid} key={selection?.id}>
          <Measure
            label={t("lab2d.centerX")}
            value={center.x}
            min={-constraints.coordinateLimit}
            max={constraints.coordinateLimit}
            unit={measurements.unit}
            step={measurements.step}
            onChange={(x) =>
              commit(
                translateSelection(plan, selection, { x: x - center.x, y: 0 }),
              )
            }
          />
          <Measure
            label={t("lab2d.centerY")}
            value={center.y}
            min={-constraints.coordinateLimit}
            max={constraints.coordinateLimit}
            unit={measurements.unit}
            step={measurements.step}
            onChange={(y) =>
              commit(
                translateSelection(plan, selection, { x: 0, y: y - center.y }),
              )
            }
          />
        </div>
      )}
    </aside>
  );
}
