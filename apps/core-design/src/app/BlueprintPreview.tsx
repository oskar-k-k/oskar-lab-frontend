"use client";

import { useState } from "react";
import BlueprintEditor from "@oskar-lab/blueprint/BlueprintEditor";
import MeasurementSettings from "@oskar-lab/blueprint/MeasurementSettings";
import { defaultMeasurements } from "@oskar-lab/blueprint/measurements";
import { type Blueprint } from "@oskar-lab/blueprint/model";
import { useI18n } from "@oskar-lab/i18n/I18nProvider";

const example: Blueprint = {
  vertices: [
    { id: "a", x: -2, y: 0 },
    { id: "b", x: 0, y: 0 },
    { id: "c", x: 2, y: -1 },
    { id: "d", x: 2, y: 1 },
  ],
  edges: [
    { id: "ab", start: "a", end: "b" },
    { id: "bc", start: "b", end: "c" },
    { id: "bd", start: "b", end: "d" },
  ],
};
/** Demonstrates unrestricted graph editing without room, furniture, storage or Three.js dependencies. */
export default function BlueprintPreview() {
  const { t } = useI18n();
  const [history, setHistory] = useState({
    past: [] as Blueprint[],
    present: example,
    future: [] as Blueprint[],
  });
  const [measurements, setMeasurements] = useState(defaultMeasurements);
  return (
    <div>
      <p>{t("blueprint.previewDescription")}</p>
      <MeasurementSettings value={measurements} onChange={setMeasurements} />
      <BlueprintEditor
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
