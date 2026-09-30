"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { useI18n } from "@oskar-lab/i18n/I18nProvider";
import { fitFurniture, type Furniture, type Room } from "../model/room";
import { planBounds } from "../model/floorPlan";
import { snapCoordinate } from "../model/measurements";
import { createFurnitureTools, type FurnitureTool } from "./furnitureTools";
import { disposeGroup, populateScene, updateCutaway } from "./scene";
import styles from "./RoomStudio.module.css";

type Props = {
  room: Room;
  selected: string | null;
  grid: boolean;
  walls: boolean;
  top: boolean;
  reset: number;
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, z: number) => void;
  onTransform: (id: string, patch: Partial<Furniture>) => void;
};

/** Renders a disposable Three.js viewport with orbit navigation and floor-plane dragging. */
export default function RoomCanvas(props: Props) {
  const { t } = useI18n();
  const host = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const [toolState, setTool] = useState<{
    id: string | null;
    mode: FurnitureTool;
  }>({ id: null, mode: "move" });
  const tool = toolState.id === props.selected ? toolState.mode : "move";
  const latest = useRef({ ...props, tool });
  const sceneApi = useRef<{
    root: THREE.Group;
    render: () => void;
    fitView: () => void;
    tools: ReturnType<typeof createFurnitureTools>;
  } | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    latest.current = { ...props, tool };
  });
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch {
      queueMicrotask(() => setFailed(true));
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.setClearColor("#eeede7");
    element.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const root = new THREE.Group();
    scene.add(root);
    scene.add(new THREE.HemisphereLight("#ffffff", "#aa9982", 2.6));
    const light = new THREE.DirectionalLight("#fff5e3", 3.2);
    light.position.set(4, 9, 5);
    light.castShadow = true;
    light.shadow.mapSize.set(2048, 2048);
    Object.assign(light.shadow.camera, {
      left: -15,
      right: 15,
      top: 15,
      bottom: -15,
      far: 40,
    });
    light.shadow.bias = -0.001;
    scene.add(light);
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 150);
    camera.position.set(7, 7, 9);
    const canvas = renderer.domElement;
    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 0.5, 0);
    controls.maxPolarAngle = Math.PI / 2 - 0.03;
    controls.minDistance = 2;
    controls.maxDistance = 110;
    const render = () => {
      updateCutaway(root, camera);
      renderer.render(scene, camera);
      const toolbar = overlay.current;
      if (!toolbar) return;
      const mesh = root.children.find(
        (object) => object.userData.itemId === latest.current.selected,
      );
      if (!mesh) {
        toolbar.style.visibility = "hidden";
        return;
      }
      const bounds = new THREE.Box3().setFromObject(mesh);
      const point = bounds.getCenter(new THREE.Vector3());
      point.y = bounds.max.y + 0.3;
      point.project(camera);
      toolbar.style.visibility = point.z > 1 ? "hidden" : "visible";
      toolbar.style.left = `${Math.max(125, Math.min(element.clientWidth - 125, ((point.x + 1) / 2) * element.clientWidth))}px`;
      toolbar.style.top = `${Math.max(90, Math.min(element.clientHeight - 100, ((1 - point.y) / 2) * element.clientHeight))}px`;
    };
    const tools = createFurnitureTools({
      scene,
      root,
      camera,
      canvas,
      orbit: controls,
      render,
      onCommit: (id, patch) => latest.current.onTransform(id, patch),
    });
    function fitView() {
      const { room, top } = latest.current;
      const bounds = planBounds(room.plan);
      const tangent = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      controls.target.set(
        bounds.centerX,
        top ? 0 : room.height * 0.3,
        bounds.centerZ,
      );
      if (top) {
        const distance =
          (Math.max(room.width / camera.aspect, room.depth) / (2 * tangent)) *
            1.2 +
          room.height;
        camera.position.set(bounds.centerX, distance, bounds.centerZ + 0.001);
      } else {
        const radius = Math.hypot(room.width, room.depth, room.height) / 2;
        const angle = Math.atan(tangent * Math.min(1, camera.aspect));
        camera.position.copy(
          new THREE.Vector3(1.3, 1.3, 1.6)
            .normalize()
            .multiplyScalar((radius / Math.sin(angle)) * 1.12)
            .add(controls.target),
        );
      }
      controls.enableRotate = !top;
      controls.update();
      render();
    }
    controls.addEventListener("change", render);
    const resize = new ResizeObserver(() => {
      const { width, height } = element.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      fitView();
    });
    resize.observe(element);
    const ray = new THREE.Raycaster(),
      pointer = new THREE.Vector2();
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    let drag: {
      id: string;
      offsetX: number;
      offsetZ: number;
      x: number;
      z: number;
      mesh: THREE.Object3D;
    } | null = null;
    function floorPoint(event: PointerEvent) {
      const rect = canvas.getBoundingClientRect();
      pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        (-(event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      ray.setFromCamera(pointer, camera);
      return ray.ray.intersectPlane(plane, new THREE.Vector3());
    }
    function down(event: PointerEvent) {
      if (event.button !== 0 || !event.isPrimary) return;
      const point = floorPoint(event);
      if (latest.current.tool !== "move" && tools.control.axis !== null) return;
      const hit = ray.intersectObjects(root.children, true).find((hit) => {
        let object: THREE.Object3D | null = hit.object;
        while (object && !object.userData.itemId) object = object.parent;
        return object?.userData.itemId;
      });
      if (!hit || !point) return;
      let mesh = hit.object;
      while (!mesh.userData.itemId && mesh.parent) mesh = mesh.parent;
      const item = latest.current.room.items.find(
        (item) => item.id === mesh.userData.itemId,
      );
      if (!item) return;
      if (latest.current.tool !== "move") {
        latest.current.onSelect(item.id);
        return;
      }
      drag = {
        id: item.id,
        offsetX: item.x - point.x,
        offsetZ: item.z - point.z,
        x: item.x,
        z: item.z,
        mesh,
      };
      controls.enabled = false;
      canvas.setPointerCapture(event.pointerId);
      event.stopImmediatePropagation();
    }
    function move(event: PointerEvent) {
      if (!drag) return;
      const point = floorPoint(event);
      if (!point) return;
      const current = latest.current;
      const item = current.room.items.find((item) => item.id === drag?.id);
      if (!item) return;
      const fitted = fitFurniture(
        {
          ...item,
          x: snapCoordinate(point.x + drag.offsetX, current.room.measurements),
          z: snapCoordinate(point.z + drag.offsetZ, current.room.measurements),
        },
        current.room,
      );
      drag.x = fitted.x;
      drag.z = fitted.z;
      drag.mesh.position.set(fitted.x, 0.005, fitted.z);
      render();
    }
    function up(event: PointerEvent) {
      if (!drag) return;
      const finished = drag;
      drag = null;
      controls.enabled = true;
      if (canvas.hasPointerCapture(event.pointerId))
        canvas.releasePointerCapture(event.pointerId);
      latest.current.onSelect(finished.id);
      if (event.type !== "pointercancel")
        latest.current.onMove(finished.id, finished.x, finished.z);
      else {
        populateScene(
          root,
          latest.current.room,
          finished.id,
          latest.current.grid,
          latest.current.walls,
        );
        render();
      }
    }
    function lost(event: Event) {
      event.preventDefault();
      setFailed(true);
    }
    canvas.addEventListener("pointerdown", down, true);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    canvas.addEventListener("webglcontextlost", lost);
    sceneApi.current = { root, render, fitView, tools };
    populateScene(
      root,
      latest.current.room,
      latest.current.selected,
      latest.current.grid,
      latest.current.walls,
    );
    controls.update();
    render();
    return () => {
      sceneApi.current = null;
      resize.disconnect();
      tools.dispose();
      controls.dispose();
      disposeGroup(root);
      light.shadow.dispose();
      renderer.dispose();
      canvas.removeEventListener("pointerdown", down, true);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      canvas.removeEventListener("webglcontextlost", lost);
      canvas.remove();
    };
  }, []);
  useEffect(() => {
    const api = sceneApi.current;
    if (!api) return;
    populateScene(
      api.root,
      props.room,
      props.selected,
      props.grid,
      props.walls,
    );
    api.tools.sync(
      props.room.items.find((item) => item.id === props.selected),
      tool,
      props.room.measurements,
    );
    api.render();
  }, [props.room, props.selected, props.grid, props.walls, tool]);
  useEffect(() => {
    const api = sceneApi.current;
    if (!api) return;
    api.fitView();
  }, [
    props.top,
    props.reset,
    props.room.width,
    props.room.depth,
    props.room.height,
    props.room.plan,
  ]);
  return (
    <div
      className={styles.canvas}
      ref={host}
      role="group"
      aria-label={t("room.viewport")}
    >
      {props.selected &&
        props.room.items.some((item) => item.id === props.selected) && (
          <div
            ref={overlay}
            className={styles.itemToolbar}
            role="toolbar"
            aria-label={t("room.objectTools")}
          >
            {(["move", "rotate", "scale"] as const).map((mode) => (
              <button
                key={mode}
                aria-pressed={tool === mode}
                onClick={() => setTool({ id: props.selected, mode })}
              >
                {t(`room.tool.${mode}`)}
              </button>
            ))}
            <span>
              {t(
                tool === "scale"
                  ? "room.scaleHint"
                  : tool === "rotate"
                    ? "room.rotateHint"
                    : "room.dragHint",
              )}
            </span>
          </div>
        )}
      {failed && (
        <div className={styles.fallback} role="alert">
          <strong>{t("room.no3d")}</strong>
          <p>{t("room.no3dHint")}</p>
          <button onClick={() => window.location.reload()}>
            {t("room.retry")}
          </button>
        </div>
      )}
    </div>
  );
}
