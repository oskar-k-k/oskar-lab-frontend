import { describe, expect, it } from "vitest";
import {
  closedOutline,
  floorArea,
  footprintInside,
  moveCorner,
  parseFloorPlan,
  planBounds,
  rectanglePlan,
  splitWall,
  validatePlan,
  wallLength,
  type FloorPlan,
} from "../src/model/floorPlan";
import {
  createFurniture,
  furnitureInside,
  parseRoom,
  starterRoom,
  withFloorPlan,
} from "../src/model/room";
import {
  defaultMeasurements,
  formatLength,
  fromDisplay,
  parseMeasurements,
  snapCoordinate,
  toDisplay,
} from "../src/model/measurements";
import legacyRoom from "./example-room.json";

function polygon(points: number[][]): FloorPlan {
  const corners = points.map(([x, z], i) => ({ id: `c${i}`, x, z }));
  return {
    corners,
    walls: corners.map((corner, i) => ({
      id: `w${i}`,
      start: corner.id,
      end: corners[(i + 1) % corners.length].id,
    })),
  };
}

describe("corner and wall editing", () => {
  it("inserts and moves a corner to create a sloped wall without losing adjacency", () => {
    const original = rectanglePlan(5, 4);
    const split = splitWall(original, "wall-1", "new-corner", "new-wall");
    const plan = moveCorner(split, "new-corner", { x: 0, z: -3 });
    expect(original.corners).toHaveLength(4);
    expect(plan.corners).toHaveLength(5);
    expect(validatePlan(plan)).toBeNull();
    expect(closedOutline(plan)).toHaveLength(5);
    expect(floorArea(plan)).toBeCloseTo(22.5);
    expect(wallLength(plan, plan.walls[0])).toBeCloseTo(Math.hypot(2.5, 1));
  });
  it("supports wall deletion, extension and reconnection as a persisted open draft", () => {
    const room = starterRoom();
    const open = {
      ...room.plan,
      walls: room.plan.walls.filter((wall) => wall.id !== "wall-1"),
    };
    expect(closedOutline(open)).toBeNull();
    expect(validatePlan(open)).toBeNull();
    expect(
      parseRoom(JSON.parse(JSON.stringify(withFloorPlan(room, open)))).plan,
    ).toEqual(open);
    const extended = {
      corners: [...open.corners, { id: "new", x: 0, z: -3 }],
      walls: [
        ...open.walls,
        { id: "new1", start: "corner-1", end: "new" },
        { id: "new2", start: "new", end: "corner-2" },
      ],
    };
    expect(closedOutline(extended)).toHaveLength(5);
  });
  it("handles concave rooms and reversed or shuffled wall directions", () => {
    const plan = polygon([
      [0, 0],
      [4, 0],
      [4, 2],
      [2, 2],
      [2, 4],
      [0, 4],
    ]);
    plan.walls.reverse().forEach((wall) => {
      const start = wall.start;
      wall.start = wall.end;
      wall.end = start;
    });
    expect(validatePlan(plan)).toBeNull();
    expect(floorArea(plan)).toBe(12);
    expect(planBounds(plan)).toMatchObject({
      centerX: 2,
      centerZ: 2,
      width: 4,
      depth: 4,
    });
  });
  it("rejects crossed walls, coincident vertices, overlapping walls and branches", () => {
    expect(
      validatePlan(
        polygon([
          [0, 0],
          [3, 3],
          [3, 0],
          [0, 3],
        ]),
      ),
    ).toBe("intersection");
    expect(
      validatePlan(
        polygon([
          [0, 0],
          [3, 0],
          [1, 0],
          [1, 3],
        ]),
      ),
    ).toBe("intersection");
    expect(
      validatePlan(
        polygon([
          [0, 0],
          [0, 0],
          [2, 2],
        ]),
      ),
    ).toBe("shortWall");
    const plan = rectanglePlan(4, 4);
    expect(
      validatePlan({
        ...plan,
        walls: [
          ...plan.walls,
          { id: "extra", start: "corner-1", end: "corner-3" },
        ],
      }),
    ).toBe("connections");
  });
  it("rejects untrusted coordinates, missing endpoints, duplicate IDs and excessive graphs", () => {
    const plan = rectanglePlan(4, 4);
    expect(() =>
      parseFloorPlan({ ...plan, corners: [{ id: "c", x: NaN, z: 0 }] }),
    ).toThrow();
    expect(() =>
      parseFloorPlan({
        ...plan,
        walls: [{ id: "w", start: "missing", end: "corner-1" }],
      }),
    ).toThrow();
    expect(() =>
      parseFloorPlan({ ...plan, corners: [...plan.corners, plan.corners[0]] }),
    ).toThrow();
    expect(() =>
      parseFloorPlan({ ...plan, corners: Array(65).fill(plan.corners[0]) }),
    ).toThrow();
    expect(() =>
      parseFloorPlan({ ...plan, corners: [{ id: "c", x: 11, z: 0 }] }),
    ).toThrow();
  });
  it("allows empty drafts and refuses multiple disconnected closed rooms", () => {
    expect(parseFloorPlan({ corners: [], walls: [] })).toEqual({
      corners: [],
      walls: [],
    });
    const a = polygon([
      [-4, -4],
      [-2, -4],
      [-3, -2],
    ]);
    const b = polygon([
      [2, 2],
      [4, 2],
      [3, 4],
    ]);
    expect(
      closedOutline({
        corners: [
          ...a.corners,
          ...b.corners.map((c) => ({ ...c, id: `b${c.id}` })),
        ],
        walls: [
          ...a.walls,
          ...b.walls.map((w) => ({
            id: `b${w.id}`,
            start: `b${w.start}`,
            end: `b${w.end}`,
          })),
        ],
      }),
    ).toBeNull();
  });
});

describe("real polygon furniture placement", () => {
  it("flags furniture in the missing part of an L-shaped room and preserves it after editing", () => {
    const original = starterRoom();
    const plan = polygon([
      [-2, -2],
      [2, -2],
      [2, 0],
      [0, 0],
      [0, 2],
      [-2, 2],
    ]);
    const room = withFloorPlan(original, plan);
    expect(room.items).toEqual(original.items);
    const chair = { ...createFurniture("chair", "chair"), x: 1, z: 1 };
    expect(furnitureInside(chair, room)).toBe(false);
    expect(furnitureInside({ ...chair, x: -1 }, room)).toBe(true);
  });
  it("detects a footprint spanning a concave notch even when all four corners are inside", () => {
    const outline = polygon([
      [0, 0],
      [4, 0],
      [4, 4],
      [3, 4],
      [3, 1],
      [1, 1],
      [1, 4],
      [0, 4],
    ]).corners;
    expect(
      footprintInside(
        [
          { x: 0.5, z: 0.5 },
          { x: 3.5, z: 0.5 },
          { x: 3.5, z: 3.5 },
          { x: 0.5, z: 3.5 },
        ],
        outline,
      ),
    ).toBe(false);
  });
});

describe("metric preferences and migration", () => {
  it("migrates existing rectangular JSON without losing furniture", () => {
    const next = parseRoom(legacyRoom);
    expect(next.version).toBe(2);
    expect(next.items).toEqual(legacyRoom.items);
    expect(floorArea(next.plan)).toBe(20);
    expect(next.measurements).toEqual(defaultMeasurements);
  });
  it("keeps centimetre conversion exact and physical snapping independent of display units", () => {
    expect(toDisplay(1.23, "cm")).toBe(123);
    expect(fromDisplay(123, "cm")).toBe(1.23);
    expect(formatLength(1.23, "cm", "en")).toBe("123 cm");
    for (const unit of ["m", "cm"] as const) {
      expect(snapCoordinate(1.234, { unit, step: 0.01, snap: true })).toBe(
        1.23,
      );
      expect(snapCoordinate(1.234, { unit, step: 0.1, snap: true })).toBe(1.2);
      expect(snapCoordinate(1.234, { unit, step: 0.1, snap: false })).toBe(
        1.234,
      );
    }
  });
  it("round-trips new preferences and rejects unsafe step values", () => {
    const room = {
      ...starterRoom(),
      measurements: { unit: "cm" as const, step: 0.01, snap: false },
    };
    expect(parseRoom(JSON.parse(JSON.stringify(room)))).toEqual(room);
    expect(() =>
      parseMeasurements({ unit: "cm", step: 0, snap: true }),
    ).toThrow();
    expect(() =>
      parseMeasurements({ unit: "feet", step: 0.1, snap: true }),
    ).toThrow();
  });
});
