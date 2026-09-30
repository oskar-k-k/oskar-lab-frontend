"use client";
import BlueprintEditor from "@oskar-lab/blueprint/BlueprintEditor";
import { useI18n } from "@oskar-lab/i18n/I18nProvider";
import {
  fromBlueprint,
  toBlueprint,
  roomConstraints,
  type FloorPlan,
} from "../model/floorPlan";
import type { Room } from "../model/room";
import Measure from "./Measure";

/** Adapts Room Studio's persisted X/Z room graph to the independent Blueprint editor. */
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
  return (
    <BlueprintEditor
      value={toBlueprint(room.plan)}
      onChange={(value) => onChange(fromBlueprint(value))}
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
