import { useRef, useState } from "react";
import { useI18n } from "@oskar-lab/i18n/I18nProvider";
import {
  catalog,
  createFurniture,
  fitFurniture,
  furnitureKinds,
  type Room,
} from "../model/room";
import { formatLength } from "../model/measurements";
import Measure from "./Measure";
import styles from "./RoomStudio.module.css";
type Props = {
  room: Room;
  ready: boolean;
  commit: (room: Room) => void;
  setSelected: (id: string | null) => void;
  importRoom: (file?: File) => Promise<void>;
};
/** Combines the furniture catalog, room settings and document import controls. */
export default function RoomLibrary({
  room,
  ready,
  commit,
  setSelected,
  importRoom,
}: Props) {
  const { t, locale } = useI18n();
  const [panel, setPanel] = useState<"furniture" | "room">("furniture");
  const fileInput = useRef<HTMLInputElement>(null);
  return (
    <aside className={styles.sidebar}>
      <div className={styles.tabs}>
        <button
          aria-pressed={panel === "furniture"}
          onClick={() => setPanel("furniture")}
        >
          {t("room.furniture")}
        </button>
        <button
          aria-pressed={panel === "room"}
          onClick={() => setPanel("room")}
        >
          {t("room.room")}
        </button>
      </div>
      {panel === "furniture" ? (
        <>
          <div className={styles.panelHeading}>
            <h2>{t("room.collection")}</h2>
            <p>{t("room.addHint")}</p>
          </div>
          <div className={styles.catalog}>
            {furnitureKinds.map((kind) => (
              <button
                key={kind}
                disabled={!ready || room.items.length >= 100}
                onClick={() => {
                  const next = fitFurniture(
                    createFurniture(kind, crypto.randomUUID()),
                    room,
                  );
                  commit({ ...room, items: [...room.items, next] });
                  setSelected(next.id);
                }}
              >
                <span className={styles.furnitureIcon} data-kind={kind}>
                  {catalog[kind].icon}
                </span>
                <strong>{t(`room.${kind}`)}</strong>
                <small>
                  {formatLength(
                    catalog[kind].width,
                    room.measurements.unit,
                    locale,
                  )}{" "}
                  ×{" "}
                  {formatLength(
                    catalog[kind].depth,
                    room.measurements.unit,
                    locale,
                  )}
                </small>
                <span className={styles.plus}>+</span>
              </button>
            ))}
          </div>
          <p className={styles.note}>{t("room.catalogHint")}</p>
        </>
      ) : (
        <div className={styles.settings}>
          <h2>{t("room.dimensions")}</h2>
          <p>{t("room.designDimensionsHint")}</p>

          <Measure
            unit={room.measurements.unit}
            step={room.measurements.step}
            label={t("room.height")}
            value={room.height}
            min={2}
            max={6}
            onChange={(height) => commit({ ...room, height })}
          />
          <h2>{t("room.finishes")}</h2>
          <label className={styles.color}>
            {t("room.wallColor")}
            <input
              type="color"
              value={room.wall}
              onChange={(event) =>
                commit({ ...room, wall: event.target.value })
              }
            />
          </label>
          <label className={styles.color}>
            {t("room.floorColor")}
            <input
              type="color"
              value={room.floor}
              onChange={(event) =>
                commit({ ...room, floor: event.target.value })
              }
            />
          </label>
        </div>
      )}
      <div className={styles.sidebarFooter}>
        <button disabled={!ready} onClick={() => fileInput.current?.click()}>
          {t("room.import")}
        </button>
        <input
          ref={fileInput}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={(event) => {
            void importRoom(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
        <button
          disabled={!ready}
          onClick={() => {
            if (window.confirm(t("room.clearConfirm"))) {
              commit({ ...room, items: [] });
              setSelected(null);
            }
          }}
        >
          {t("room.clear")}
        </button>
      </div>
    </aside>
  );
}
