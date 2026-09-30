"use client";
import { useI18n } from "@oskar-lab/i18n/I18nProvider";
import {
  connectedEdges,
  edgeLength,
  moveVertex,
  splitEdge,
  type Blueprint,
  type BlueprintSelection,
  type BlueprintConstraints,
} from "../model/blueprint";
import { formatLength, type Measurements } from "../model/measurements";
import Measure from "./Measure";
import styles from "./Blueprint.module.css";

/** Shows exact coordinates and topology actions for the current selection. */
export default function BlueprintInspector({
  plan,
  selection,
  measurements,
  constraints,
  commit,
  setSelection,
  extend,
  onDeleteVertex,
}: {
  plan: Blueprint;
  selection: BlueprintSelection;
  measurements: Measurements;
  constraints: BlueprintConstraints;
  commit: (plan: Blueprint) => boolean;
  setSelection: (selection: BlueprintSelection) => void;
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
  const length = (value: number) =>
    formatLength(value, measurements.unit, locale);
  const vertexName = (id: string) =>
    t("blueprint.vertexNumber", {
      number: plan.vertices.findIndex((v) => v.id === id) + 1,
    });
  return (
    <aside className={`${styles.inspector} ${styles.planInspector}`}>
      <p className={styles.eyebrow}>{t("blueprint.inspector")}</p>
      {selectedVertex ? (
        <>
          <h2>{vertexName(selectedVertex.id)}</h2>
          <p>{t("blueprint.vertexHint")}</p>
          <div className={styles.measureGrid} key={selectedVertex.id}>
            <Measure
              label={t("blueprint.positionX")}
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
              label={t("blueprint.positionY")}
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
          <h2>{t("blueprint.connectedEdges")}</h2>
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
            {t("blueprint.extendVertex")}
          </button>
          <button
            className={styles.removePlan}
            onClick={() => {
              if (
                commit({
                  vertices: plan.vertices.filter(
                    (vertex) => vertex.id !== selectedVertex.id,
                  ),
                  edges: plan.edges.filter(
                    (edge) =>
                      edge.start !== selectedVertex.id &&
                      edge.end !== selectedVertex.id,
                  ),
                })
              ) {
                setSelection(null);
                onDeleteVertex();
              }
            }}
          >
            {t("blueprint.deleteVertex")}
          </button>
        </>
      ) : selectedEdge ? (
        <>
          <h2>
            {t("blueprint.edgeNumber", {
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
            {t("blueprint.splitEdge")}
          </button>
          <button
            className={styles.removePlan}
            onClick={() => {
              if (
                commit({
                  ...plan,
                  edges: plan.edges.filter(
                    (edge) => edge.id !== selectedEdge.id,
                  ),
                })
              )
                extend(selectedEdge.start);
            }}
          >
            {t("blueprint.deleteEdge")}
          </button>
          <p>{t("blueprint.deleteEdgeHint")}</p>
        </>
      ) : (
        <div className={styles.emptySelection}>
          <span>◇</span>
          <h2>{t("blueprint.selectVertex")}</h2>
          <p>{t("blueprint.vertexSelectionHint")}</p>
        </div>
      )}
    </aside>
  );
}
