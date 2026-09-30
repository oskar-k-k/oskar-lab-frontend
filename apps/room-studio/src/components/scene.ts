import * as THREE from "three";
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
  box(root, [room.width, 0.12, room.depth], [0, -0.06, 0], room.floor);
  if (walls) {
    box(
      root,
      [room.width + 0.12, room.height, 0.1],
      [0, room.height / 2, -room.depth / 2 - 0.05],
      room.wall,
    );
    box(
      root,
      [0.1, room.height, room.depth],
      [-room.width / 2 - 0.05, room.height / 2, 0],
      room.wall,
    );
    box(
      root,
      [room.width, 0.1, 0.035],
      [0, 0.05, -room.depth / 2 + 0.02],
      "#faf7f0",
    );
    box(
      root,
      [0.035, 0.1, room.depth],
      [-room.width / 2 + 0.02, 0.05, 0],
      "#faf7f0",
    );
  }
  if (grid) {
    const lines: number[] = [];
    for (let x = -room.width / 2; x <= room.width / 2; x += 0.5)
      lines.push(x, 0.003, -room.depth / 2, x, 0.003, room.depth / 2);
    for (let z = -room.depth / 2; z <= room.depth / 2; z += 0.5)
      lines.push(-room.width / 2, 0.003, z, room.width / 2, 0.003, z);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(lines, 3),
    );
    root.add(
      new THREE.LineSegments(
        geometry,
        new THREE.LineBasicMaterial({
          color: "#8b775f",
          transparent: true,
          opacity: 0.22,
        }),
      ),
    );
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
