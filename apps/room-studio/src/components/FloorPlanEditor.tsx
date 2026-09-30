"use client";
import { closedOutline } from "@oskar-lab/2d-lab/model";
import Editor2D from "@oskar-lab/2d-lab/Editor2D";
import { useI18n } from "@oskar-lab/i18n/I18nProvider";
import {
  fromMesh,
  toMesh,
  roomConstraints,
  type FloorPlan,
} from "../model/floorPlan";
import type { Room } from "../model/room";
import Measure from "./Measure";

/** Adapts Room Studio's persisted X/Z room graph to the independent Mesh2D editor. */
export default function FloorPlanEditor({
  room,
  onChange,
  onHeight,
  undo,
  redo,
  canUndo,
  canRedo,
}: {
  room: Room;
  onChange: (plan: FloorPlan) => void;
  onHeight: (height: number) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}) {
  const { t } = useI18n();
  const mesh = toMesh(room.plan);
  const outline = closedOutline(mesh);
  if (outline)
    mesh.faces = [{ id: "room-floor", vertices: outline.map((v) => v.id) }];
  return (
    <Editor2D
      value={mesh}
      allowFaceCreation={false}
      onChange={(value) => onChange(fromMesh(value))}
      measurements={room.measurements}
      constraints={roomConstraints}
      undo={undo}
      redo={redo}
      canUndo={canUndo}
      canRedo={canRedo}
      sidebarContent={
        <Measure
          label={t("room.height")}
          value={room.height}
          min={2}
          max={6}
          unit={room.measurements.unit}
          step={room.measurements.step}
          onChange={onHeight}
        />
      }
    />
  );
}
