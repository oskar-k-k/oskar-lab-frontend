import * as THREE from "three";
import { closedOutline, planBounds, type Point } from "../model/floorPlan";
import type { Furniture, Room } from "../model/room";

function box(
  group: THREE.Group,
  size: number[],
  position: number[],
  color: string,
) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(...(size as [number, number, number])),
    new THREE.MeshStandardMaterial({ color, roughness: 0.85 }),
  );
  mesh.position.set(...(position as [number, number, number]));
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

/** Builds recognizable furniture from lightweight, dimensioned primitives. */
export function furnitureMesh(item: Furniture): THREE.Group {
  const group = new THREE.Group();
  const { width: w, depth: d, height: h, color } = item;
  const legs = (height: number) => {
    for (const x of [-1, 1])
      for (const z of [-1, 1])
        box(
          group,
          [0.06, height, 0.06],
          [x * (w / 2 - 0.07), height / 2, z * (d / 2 - 0.07)],
          "#65564a",
        );
  };
  if (item.kind === "bed") {
    box(group, [w, h * 0.3, d], [0, h * 0.2, 0], "#8e755b");
    box(group, [w * 0.97, h * 0.27, d * 0.96], [0, h * 0.48, 0], "#f4f0e8");
    box(group, [w * 0.99, h * 0.12, d * 0.66], [0, h * 0.67, d * 0.15], color);
    box(group, [w, h, d * 0.045], [0, h / 2, -d * 0.477], "#9e856c");
    for (const x of [-1, 1])
      box(
        group,
        [w * 0.39, h * 0.12, d * 0.19],
        [x * w * 0.24, h * 0.66, -d * 0.3],
        "#fffaf1",
      );
  } else if (item.kind === "sofa" || item.kind === "chair") {
    legs(h * 0.35);
    box(group, [w, h * 0.22, d], [0, h * 0.44, 0], color);
    box(group, [w, h * 0.5, d * 0.18], [0, h * 0.75, -d * 0.41], color);
    if (item.kind === "sofa")
      for (const x of [-1, 1])
        box(group, [w * 0.09, h * 0.5, d], [x * w * 0.455, h * 0.57, 0], color);
  } else if (item.kind === "table") {
    legs(h * 0.92);
    box(group, [w, h * 0.08, d], [0, h * 0.96, 0], color);
  } else if (item.kind === "shelf") {
    for (const x of [-1, 1])
      box(group, [w * 0.05, h, d], [x * w * 0.475, h / 2, 0], color);
    for (let i = 0; i < 5; i++)
      box(group, [w, h * 0.025, d], [0, h * (0.02 + i * 0.24), 0], color);
    box(group, [w, h, d * 0.05], [0, h / 2, -d * 0.475], color);
    for (let i = 0; i < 4; i++)
      box(
        group,
        [w * 0.12, h * 0.16, d * 0.7],
        [-w * 0.3 + i * w * 0.14, h * 0.35, 0],
        ["#738576", "#d0ad82", "#ece3d3", "#a96e52"][i],
      );
  } else if (item.kind === "plant") {
    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(w * 0.35, w * 0.25, h * 0.35, 24),
      new THREE.MeshStandardMaterial({ color: "#b98260" }),
    );
    pot.position.y = h * 0.175;
    group.add(pot);
    const leaves = new THREE.Mesh(
      new THREE.SphereGeometry(1, 16, 12),
      new THREE.MeshStandardMaterial({ color }),
    );
    leaves.scale.set(w / 2, h * 0.34, d / 2);
    leaves.position.y = h * 0.66;
    leaves.castShadow = true;
    group.add(leaves);
  } else {
    box(group, [w, h, d], [0, h / 2, 0], color);
    if (item.kind === "wardrobe") {
      box(
        group,
        [0.008, h * 0.96, 0.008],
        [0, h / 2, d / 2 + 0.005],
        "#a99a88",
      );
      for (const x of [-1, 1])
        box(
          group,
          [0.025, h * 0.1, 0.025],
          [x * 0.06, h * 0.5, d / 2 + 0.02],
          "#6c665f",
        );
    }
  }
  group.position.set(item.x, 0.005, item.z);
  group.rotation.y = (-item.rotation * Math.PI) / 180;
  group.userData.itemId = item.id;
  return group;
}

/** Rebuilds the room shell and furniture while preserving camera controls. */
export function populateScene(
  root: THREE.Group,
  room: Room,
  selected: string | null,
  grid: boolean,
  walls: boolean,
) {
  disposeGroup(root);
  const outline = closedOutline(room.plan);
  if (outline) {
    const shape = new THREE.Shape(
      outline.map((point) => new THREE.Vector2(point.x, -point.z)),
    );
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.12,
      bevelEnabled: false,
    });
    const floor = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({ color: room.floor, roughness: 0.85 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.12;
    floor.receiveShadow = true;
    root.add(floor);
    if (walls) {
      outline.forEach((a, index) => {
        const b = outline[(index + 1) % outline.length];
        const length = Math.hypot(b.x - a.x, b.z - a.z);
        const wall = box(
          root,
          [length, room.height, 0.08],
          [(a.x + b.x) / 2, room.height / 2, (a.z + b.z) / 2],
          room.wall,
        );
        wall.rotation.y = -Math.atan2(b.z - a.z, b.x - a.x);
        wall.userData.wallNormal = {
          x: (b.z - a.z) / length,
          z: -(b.x - a.x) / length,
        };
        const trim = box(
          root,
          [length, 0.09, 0.095],
          [(a.x + b.x) / 2, 0.045, (a.z + b.z) / 2],
          "#faf7f0",
        );
        trim.rotation.y = wall.rotation.y;
      });
    }
    if (grid) addFloorGrid(root, room, outline);
  }
  for (const item of room.items) {
    const mesh = furnitureMesh(item);
    root.add(mesh);
    if (item.id === selected) {
      const outline = new THREE.BoxHelper(mesh, "#476d5a");
      root.add(outline);
    }
  }
}

function addFloorGrid(root: THREE.Group, room: Room, outline: Point[]) {
  const bounds = planBounds(room.plan);
  const step = Math.max(0.1, room.measurements.step);
  const lines: number[] = [];
  for (const axis of ["x", "z"] as const) {
    const other = axis === "x" ? "z" : "x";
    const min = axis === "x" ? bounds.minX : bounds.minZ;
    const max = axis === "x" ? bounds.maxX : bounds.maxZ;
    for (let fixed = Math.ceil(min / step) * step; fixed < max; fixed += step) {
      const cuts: number[] = [];
      outline.forEach((a, index) => {
        const b = outline[(index + 1) % outline.length];
        if (
          (a[axis] <= fixed && b[axis] > fixed) ||
          (b[axis] <= fixed && a[axis] > fixed)
        ) {
          cuts.push(
            a[other] +
              ((b[other] - a[other]) * (fixed - a[axis])) / (b[axis] - a[axis]),
          );
        }
      });
      cuts.sort((a, b) => a - b);
      for (let i = 0; i + 1 < cuts.length; i += 2) {
        if (axis === "x")
          lines.push(fixed, 0.003, cuts[i], fixed, 0.003, cuts[i + 1]);
        else lines.push(cuts[i], 0.003, fixed, cuts[i + 1], 0.003, fixed);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(lines, 3));
  root.add(
    new THREE.LineSegments(
      geometry,
      new THREE.LineBasicMaterial({
        color: "#8b775f",
        transparent: true,
        opacity: 0.2,
      }),
    ),
  );
}

/** Hides camera-facing walls so the interior remains editable from every orbit angle. */
export function updateCutaway(root: THREE.Group, camera: THREE.Camera) {
  for (const object of root.children) {
    const normal = object.userData.wallNormal;
    if (normal)
      object.visible =
        (camera.position.x - object.position.x) * normal.x +
          (camera.position.z - object.position.z) * normal.z <=
        0;
  }
}

/** Releases GPU allocations before replacing a scene or unmounting it. */
export function disposeGroup(group: THREE.Group) {
  group.traverse((object) => {
    if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) {
      object.geometry.dispose();
      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];
      materials.forEach((material) => material.dispose());
    }
  });
  group.clear();
}
