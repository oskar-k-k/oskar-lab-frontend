export const furnitureKinds = [
  "bed",
  "sofa",
  "table",
  "chair",
  "wardrobe",
  "shelf",
  "rug",
  "plant",
] as const;
export type FurnitureKind = (typeof furnitureKinds)[number];
export type Furniture = {
  id: string;
  kind: FurnitureKind;
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  rotation: number;
  color: string;
};
export type Room = {
  version: 1;
  name: string;
  width: number;
  depth: number;
  height: number;
  wall: string;
  floor: string;
  items: Furniture[];
};
export const catalog: Record<
  FurnitureKind,
  { width: number; depth: number; height: number; color: string; icon: string }
> = {
  bed: { width: 1.6, depth: 2.1, height: 0.85, color: "#b8c4a8", icon: "▰" },
  sofa: { width: 2.2, depth: 0.9, height: 0.85, color: "#b58062", icon: "▱" },
  table: { width: 1.4, depth: 0.8, height: 0.75, color: "#be956b", icon: "⊓" },
  chair: { width: 0.5, depth: 0.5, height: 0.85, color: "#8b9b80", icon: "▥" },
  wardrobe: {
    width: 1.5,
    depth: 0.6,
    height: 2.1,
    color: "#d5c7b4",
    icon: "▯",
  },
  shelf: { width: 1, depth: 0.35, height: 1.8, color: "#ba956e", icon: "▤" },
  rug: { width: 2, depth: 2.6, height: 0.02, color: "#d3b797", icon: "▧" },
  plant: { width: 0.5, depth: 0.5, height: 1.1, color: "#648565", icon: "♧" },
};

/** Creates a dimensioned furniture item in metres. */
export function createFurniture(kind: FurnitureKind, id: string): Furniture {
  const { width, depth, height, color } = catalog[kind];
  return { id, kind, width, depth, height, color, x: 0, z: 0, rotation: 0 };
}

/** Keeps the entire rotated footprint inside the room, reducing oversize items if necessary. */
export function fitFurniture(
  item: Furniture,
  room: Pick<Room, "width" | "depth" | "height">,
): Furniture {
  const angle = (item.rotation * Math.PI) / 180;
  const c = Math.abs(Math.cos(angle)),
    s = Math.abs(Math.sin(angle));
  const extentX = item.width * c + item.depth * s;
  const extentZ = item.width * s + item.depth * c;
  const scale = Math.min(1, room.width / extentX, room.depth / extentZ);
  const halfX = (extentX * scale) / 2,
    halfZ = (extentZ * scale) / 2;
  return {
    ...item,
    width: item.width * scale,
    depth: item.depth * scale,
    height: Math.min(item.height, room.height),
    x: Math.max(
      -room.width / 2 + halfX,
      Math.min(room.width / 2 - halfX, item.x),
    ),
    z: Math.max(
      -room.depth / 2 + halfZ,
      Math.min(room.depth / 2 - halfZ, item.z),
    ),
  };
}

/** Creates a furnished starter room without accessing browser APIs. */
export function starterRoom(): Room {
  return {
    version: 1,
    name: "",
    width: 5,
    depth: 4,
    height: 2.7,
    wall: "#e9e5dc",
    floor: "#c8ab87",
    items: [
      { ...createFurniture("rug", "starter-rug"), x: -0.6, z: -0.1 },
      { ...createFurniture("bed", "starter-bed"), x: -1.35, z: -0.7 },
      { ...createFurniture("table", "starter-table"), x: 1.3, z: -1.35 },
      { ...createFurniture("chair", "starter-chair"), x: 1.3, z: -0.55 },
      { ...createFurniture("plant", "starter-plant"), x: 2.05, z: 1.4 },
      { ...createFurniture("shelf", "starter-shelf"), x: -1.7, z: 1.65 },
    ],
  };
}

const colorPattern = /^#[0-9a-f]{6}$/i;
function numberIn(value: unknown, min: number, max: number): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= min &&
    value <= max
  );
}
function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Validates untrusted saved/imported JSON and returns a clean, bounded document. */
export function parseRoom(value: unknown): Room {
  if (
    !record(value) ||
    value.version !== 1 ||
    typeof value.name !== "string" ||
    value.name.length > 80 ||
    !numberIn(value.width, 2, 20) ||
    !numberIn(value.depth, 2, 20) ||
    !numberIn(value.height, 2, 6) ||
    typeof value.wall !== "string" ||
    !colorPattern.test(value.wall) ||
    typeof value.floor !== "string" ||
    !colorPattern.test(value.floor) ||
    !Array.isArray(value.items) ||
    value.items.length > 100
  )
    throw new Error("Invalid room");
  const room: Room = {
    version: 1,
    name: value.name,
    width: value.width,
    depth: value.depth,
    height: value.height,
    wall: value.wall,
    floor: value.floor,
    items: [],
  };
  const ids = new Set<string>();
  room.items = value.items.map((item) => {
    if (
      !record(item) ||
      typeof item.id !== "string" ||
      item.id.length > 100 ||
      !item.id ||
      ids.has(item.id) ||
      !furnitureKinds.includes(item.kind as FurnitureKind) ||
      !numberIn(item.width, 0.01, 20) ||
      !numberIn(item.depth, 0.01, 20) ||
      !numberIn(item.height, 0.01, 6) ||
      !numberIn(item.x, -20, 20) ||
      !numberIn(item.z, -20, 20) ||
      !numberIn(item.rotation, 0, 360) ||
      typeof item.color !== "string" ||
      !colorPattern.test(item.color)
    )
      throw new Error("Invalid furniture");
    ids.add(item.id);
    return fitFurniture(
      {
        id: item.id,
        kind: item.kind as FurnitureKind,
        width: item.width,
        depth: item.depth,
        height: item.height,
        x: item.x,
        z: item.z,
        rotation: item.rotation,
        color: item.color,
      },
      room,
    );
  });
  return room;
}

/** Updates dimensions and keeps every furniture item inside the new envelope. */
export function resizeRoom(
  room: Room,
  patch: Partial<Pick<Room, "width" | "depth" | "height">>,
): Room {
  const next = { ...room, ...patch };
  return { ...next, items: next.items.map((item) => fitFurniture(item, next)) };
}
