"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { useI18n } from "@oskar-lab/i18n/I18nProvider";
import { fitFurniture, type Room } from "../model/room";
import { disposeGroup, populateScene } from "./scene";
import styles from "./RoomStudio.module.css";

type Props = {
  room: Room;
  selected: string | null;
  grid: boolean;
  walls: boolean;
  snap: boolean;
  top: boolean;
  reset: number;
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, z: number) => void;
};

/** Renders a disposable Three.js viewport with orbit navigation and floor-plane dragging. */
export default function RoomCanvas(props: Props) {
  const { t } = useI18n();
  const host = useRef<HTMLDivElement>(null);
  const latest = useRef(props);
  const sceneApi = useRef<{
    root: THREE.Group;
    render: () => void;
    fitView: () => void;
  } | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    latest.current = props;
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
    const render = () => renderer.render(scene, camera);
    function fitView() {
      const { room, top } = latest.current;
      const tangent = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      controls.target.set(0, top ? 0 : room.height * 0.3, 0);
      if (top) {
        const distance =
          (Math.max(room.width / camera.aspect, room.depth) / (2 * tangent)) *
            1.2 +
          room.height;
        camera.position.set(0, distance, 0.001);
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
      const step = current.snap ? 0.1 : 0.01;
      const fitted = fitFurniture(
        {
          ...item,
          x: Math.round((point.x + drag.offsetX) / step) * step,
          z: Math.round((point.z + drag.offsetZ) / step) * step,
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
    sceneApi.current = { root, render, fitView };
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
    api.render();
  }, [props.room, props.selected, props.grid, props.walls]);
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
  ]);
  return (
    <div
      className={styles.canvas}
      ref={host}
      role="img"
      aria-label={t("room.viewport")}
    >
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
