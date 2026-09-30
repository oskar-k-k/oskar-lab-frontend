import { useI18n } from "@oskar-lab/i18n/I18nProvider";
import {
  catalog,
  fitFurniture,
  furnitureInside,
  type Furniture,
  type Room,
} from "../model/room";
import Measure from "./Measure";
import styles from "./RoomStudio.module.css";

type Props = {
  room: Room;
  selected: string | null;
  setSelected: (id: string | null) => void;
  commit: (room: Room) => void;
  updateItem: (patch: Partial<Furniture>) => void;
};
/** Edits the selected furniture and exposes every object through keyboard-accessible controls. */
export default function RoomInspector({
  room,
  selected,
  setSelected,
  commit,
  updateItem,
}: Props) {
  const { t } = useI18n();
  const item = room.items.find((item) => item.id === selected);
  return (
    <aside className={styles.inspector}>
      <p className={styles.eyebrow}>{t("room.inspector")}</p>
      {item ? (
        <>
          <h2>{t(`room.${item.kind}`)}</h2>
          <p>{t("room.editHint")}</p>
          {!furnitureInside(item, room) && (
            <p role="status" className={styles.planNotice}>
              {t("room.outsideItem")}
            </p>
          )}
          <div className={styles.measureGrid}>
            <Measure
              unit={room.measurements.unit}
              step={room.measurements.step}
              label={t("room.width")}
              value={item.width}
              min={0.05}
              max={20}
              onChange={(width) => updateItem({ width })}
            />
            <Measure
              unit={room.measurements.unit}
              step={room.measurements.step}
              label={t("room.depth")}
              value={item.depth}
              min={0.05}
              max={20}
              onChange={(depth) => updateItem({ depth })}
            />
            <Measure
              unit={room.measurements.unit}
              step={room.measurements.step}
              label={t("room.height")}
              value={item.height}
              min={0.01}
              max={6}
              onChange={(height) => updateItem({ height })}
            />
            <Measure
              label={t("room.rotation")}
              value={item.rotation}
              min={0}
              max={360}
              step={1}
              onChange={(rotation) => updateItem({ rotation })}
            />
            <Measure
              unit={room.measurements.unit}
              step={room.measurements.step}
              label={t("room.positionX")}
              value={item.x}
              min={-10}
              max={10}
              onChange={(x) => updateItem({ x })}
            />
            <Measure
              unit={room.measurements.unit}
              step={room.measurements.step}
              label={t("room.positionZ")}
              value={item.z}
              min={-10}
              max={10}
              onChange={(z) => updateItem({ z })}
            />
          </div>
          <label className={styles.color}>
            {t("room.color")}
            <input
              type="color"
              value={item.color}
              onChange={(event) => updateItem({ color: event.target.value })}
            />
          </label>
          <div className={styles.itemActions}>
            <button
              onClick={() =>
                updateItem({ rotation: (item.rotation + 90) % 360 })
              }
            >
              {t("room.rotate")}
            </button>
            <button
              disabled={room.items.length >= 100}
              onClick={() => {
                const copy = fitFurniture(
                  {
                    ...item,
                    id: crypto.randomUUID(),
                    x: item.x + 0.25,
                    z: item.z + 0.25,
                  },
                  room,
                );
                commit({ ...room, items: [...room.items, copy] });
                setSelected(copy.id);
              }}
            >
              {t("room.duplicate")}
            </button>
            <button
              className={styles.delete}
              onClick={() => {
                commit({
                  ...room,
                  items: room.items.filter((entry) => entry.id !== item.id),
                });
                setSelected(null);
              }}
            >
              {t("room.delete")}
            </button>
          </div>
        </>
      ) : (
        <div className={styles.emptySelection}>
          <span>⌖</span>
          <h2>{t("room.select")}</h2>
          <p>{t("room.selectHint")}</p>
        </div>
      )}
      <div className={styles.objectList}>
        <h2>
          {t("room.objects")} <span>{room.items.length}/100</span>
        </h2>
        {room.items.length === 0 && <p>{t("room.empty")}</p>}
        {room.items.map((entry, index) => (
          <button
            key={entry.id}
            aria-pressed={selected === entry.id}
            onClick={() => setSelected(entry.id)}
          >
            <span>
              {catalog[entry.kind].icon} {t(`room.${entry.kind}`)}
            </span>
            <small>{String(index + 1).padStart(2, "0")}</small>
          </button>
        ))}
      </div>
    </aside>
  );
}
