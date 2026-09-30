"use client";

import { useState } from "react";
import Editor2D from "@oskar-lab/2d-lab/Editor2D";
import MeasurementSettings from "@oskar-lab/2d-lab/MeasurementSettings";
import { defaultMeasurements } from "@oskar-lab/2d-lab/measurements";
import { type Mesh2D } from "@oskar-lab/2d-lab/model";
import { useI18n } from "@oskar-lab/i18n/I18nProvider";

const example: Mesh2D = {
  vertices: [
    { id: "a", x: -2, y: -1 },
    { id: "b", x: 0, y: -1 },
    { id: "c", x: 2, y: -1 },
    { id: "d", x: 2, y: 1 },
    { id: "e", x: 0, y: 1 },
    { id: "f", x: -2, y: 1 },
  ],
  edges: [
    { id: "ab", start: "a", end: "b" },
    { id: "bc", start: "b", end: "c" },
    { id: "cd", start: "c", end: "d" },
    { id: "de", start: "d", end: "e" },
    { id: "ef", start: "e", end: "f" },
    { id: "fa", start: "f", end: "a" },
    { id: "be", start: "b", end: "e" },
  ],
  faces: [
    { id: "left", vertices: ["a", "b", "e", "f"] },
    { id: "right", vertices: ["b", "c", "d", "e"] },
  ],
};
/** Demonstrates unrestricted graph editing without room, furniture, storage or Three.js dependencies. */
export default function Lab2DPreview() {
  const { t } = useI18n();
  const [history, setHistory] = useState({
    past: [] as Mesh2D[],
    present: example,
    future: [] as Mesh2D[],
  });
  const [measurements, setMeasurements] = useState(defaultMeasurements);
  return (
    <div>
      <p>{t("lab2d.previewDescription")}</p>
      <MeasurementSettings value={measurements} onChange={setMeasurements} />
      <Editor2D
        value={history.present}
        measurements={measurements}
        onChange={(present) =>
          setHistory((h) => ({
            past: [...h.past.slice(-49), h.present],
            present,
            future: [],
          }))
        }
        canUndo={history.past.length > 0}
        canRedo={history.future.length > 0}
        undo={() =>
          setHistory((h) =>
            h.past.length
              ? {
                  past: h.past.slice(0, -1),
                  present: h.past[h.past.length - 1],
                  future: [h.present, ...h.future],
                }
              : h,
          )
        }
        redo={() =>
          setHistory((h) =>
            h.future.length
              ? {
                  past: [...h.past, h.present],
                  present: h.future[0],
                  future: h.future.slice(1),
                }
              : h,
          )
        }
      />
    </div>
  );
}
