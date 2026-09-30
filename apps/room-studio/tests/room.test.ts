import { describe, expect, it } from "vitest";
import {
  createFurniture,
  fitFurniture,
  parseRoom,
  resizeRoom,
  starterRoom,
} from "../src/model/room";

describe("room documents", () => {
  it("round-trips the starter room without losing furniture or dimensions", () => {
    const room = starterRoom();
    expect(parseRoom(JSON.parse(JSON.stringify(room)))).toEqual(room);
  });
  it("rejects duplicate ids, unknown furniture, nonfinite dimensions and untrusted colours", () => {
    const room = starterRoom();
    expect(() =>
      parseRoom({ ...room, items: [room.items[0], room.items[0]] }),
    ).toThrow();
    expect(() => parseRoom({ ...room, width: Infinity })).toThrow();
    expect(() => parseRoom({ ...room, wall: "url(remote)" })).toThrow();
    expect(() =>
      parseRoom({ ...room, items: [{ ...room.items[0], kind: "script" }] }),
    ).toThrow();
    expect(() =>
      parseRoom({
        ...room,
        items: Array.from({ length: 101 }, (_, i) => ({
          ...room.items[0],
          id: String(i),
        })),
      }),
    ).toThrow();
  });
  it("constrains a rotated item by its full footprint", () => {
    const room = starterRoom();
    const item = fitFurniture(
      { ...createFurniture("bed", "a"), x: 20, z: -20, rotation: 90 },
      room,
    );
    expect(item.x).toBeCloseTo(room.width / 2 - item.depth / 2);
    expect(item.z).toBeCloseTo(-room.depth / 2 + item.width / 2);
  });
  it("shrinks oversized furniture to fit without mutating the old document", () => {
    const room = starterRoom();
    const original = structuredClone(room);
    const next = resizeRoom(room, { width: 2, depth: 2, height: 2 });
    expect(room).toEqual(original);
    for (const item of next.items) {
      expect(Math.abs(item.x) + item.width / 2).toBeLessThanOrEqual(1.00001);
      expect(Math.abs(item.z) + item.depth / 2).toBeLessThanOrEqual(1.00001);
      expect(item.height).toBeLessThanOrEqual(2);
    }
  });
  it("fits diagonal furniture into narrow rooms", () => {
    const item = fitFurniture(
      { ...createFurniture("table", "a"), width: 15, depth: 12, rotation: 45 },
      { width: 2, depth: 3, height: 2 },
    );
    expect((item.width + item.depth) * Math.SQRT1_2).toBeCloseTo(2);
  });
});
