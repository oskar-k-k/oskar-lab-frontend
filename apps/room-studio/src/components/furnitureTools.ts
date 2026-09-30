import * as THREE from "three";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import type { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { Furniture } from "../model/room";
import type { Measurements } from "../model/measurements";

export type FurnitureTool = "move" | "rotate" | "scale";

/** Adds native Three.js rotation/scale handles while keeping undo commits atomic per gesture. */
export function createFurnitureTools({
  scene,
  root,
  camera,
  canvas,
  orbit,
  render,
  onCommit,
}: {
  scene: THREE.Scene;
  root: THREE.Group;
  camera: THREE.Camera;
  canvas: HTMLCanvasElement;
  orbit: OrbitControls;
  render: () => void;
  onCommit: (id: string, patch: Partial<Furniture>) => void;
}) {
  const proxy = new THREE.Object3D();
  scene.add(proxy);
  const control = new TransformControls(camera, canvas);
  const helper = control.getHelper();
  scene.add(helper);
  control.setSpace("local");
  control.setSize(0.85);
  control.showE = false;
  control.showXYZE = false;
  control.showXY = false;
  control.showYZ = false;
  control.showXZ = false;
  let selected: Furniture | undefined;
  let active: Furniture | null = null;

  function values(): Partial<Furniture> {
    return {
      width: Math.max(0.05, Math.min(20, proxy.scale.x)),
      height: Math.max(0.01, Math.min(6, proxy.scale.y)),
      depth: Math.max(0.05, Math.min(20, proxy.scale.z)),
      rotation: Number(
        (
          ((-THREE.MathUtils.radToDeg(proxy.rotation.y) % 360) + 360) %
          360
        ).toFixed(2),
      ),
    };
  }

  function resetProxy(item: Furniture) {
    proxy.position.set(item.x, 0, item.z);
    proxy.rotation.set(0, -THREE.MathUtils.degToRad(item.rotation), 0);
    proxy.scale.set(item.width, item.height, item.depth);
    proxy.updateMatrixWorld(true);
  }

  function preview() {
    if (!active) return;
    const mesh = root.children.find(
      (object) => object.userData.itemId === active?.id,
    );
    if (!mesh) return;
    const next = { ...active, ...values() };
    proxy.scale.set(next.width, next.height, next.depth);
    mesh.scale.set(
      next.width / active.width,
      next.height / active.height,
      next.depth / active.depth,
    );
    mesh.rotation.y = -THREE.MathUtils.degToRad(next.rotation);
    root.children.forEach((object) => {
      if (object instanceof THREE.BoxHelper) object.update();
    });
    render();
  }

  function start() {
    active = selected ? { ...selected } : null;
    orbit.enabled = false;
  }
  function finish() {
    const original = active;
    active = null;
    orbit.enabled = true;
    if (original) onCommit(original.id, values());
  }
  function cancel() {
    if (!active) return;
    control.reset();
    const mesh = root.children.find(
      (object) => object.userData.itemId === active?.id,
    );
    if (mesh) {
      mesh.scale.set(1, 1, 1);
      mesh.rotation.y = -THREE.MathUtils.degToRad(active.rotation);
    }
    resetProxy(active);
    active = null;
    orbit.enabled = true;
    control.dragging = false;
    root.children.forEach((object) => {
      if (object instanceof THREE.BoxHelper) object.update();
    });
    render();
  }
  function key(event: KeyboardEvent) {
    if (event.key === "Escape") cancel();
  }
  control.addEventListener("mouseDown", start);
  control.addEventListener("objectChange", preview);
  control.addEventListener("mouseUp", finish);
  control.addEventListener("change", render);
  canvas.addEventListener("pointercancel", cancel);
  window.addEventListener("keydown", key);

  return {
    control,
    /** Updates the selected proxy after committed edits or changes of tool/unit settings. */
    sync(
      item: Furniture | undefined,
      tool: FurnitureTool,
      measurements: Measurements,
    ) {
      if (active) return;
      selected = item;
      if (!item || tool === "move") {
        control.detach();
        control.enabled = false;
        return;
      }
      resetProxy(item);
      control.setMode(tool);
      control.showX = tool === "scale";
      control.showY = true;
      control.showZ = tool === "scale";
      control.setRotationSnap(
        measurements.snap ? THREE.MathUtils.degToRad(5) : null,
      );
      control.setScaleSnap(measurements.snap ? measurements.step : null);
      control.enabled = true;
      control.attach(proxy);
    },
    cancel,
    dispose() {
      cancel();
      canvas.removeEventListener("pointercancel", cancel);
      window.removeEventListener("keydown", key);
      control.removeEventListener("change", render);
      control.removeEventListener("mouseDown", start);
      control.removeEventListener("objectChange", preview);
      control.removeEventListener("mouseUp", finish);
      control.dispose();
      scene.remove(helper, proxy);
    },
  };
}
