import type {cameraAt, Vector3} from "./choreography";

export type ScreenPoint = {x: number; y: number; scale: number; visible: boolean};
type Camera = ReturnType<typeof cameraAt>;

/** Projects scene geometry and labels with the same camera and near-plane clipping. */
export function makeProjection(camera: Camera) {
    const cy = Math.cos(camera.yaw), sy = Math.sin(camera.yaw);
    const cp = Math.cos(camera.pitch), sp = Math.sin(camera.pitch);
    const cr = Math.cos(camera.roll), sr = Math.sin(camera.roll);
    return ({x, y, z}: Vector3): ScreenPoint => {
        const rx = (x - camera.x) * cy + z * sy;
        const rz = z * cy - (x - camera.x) * sy;
        const ry = y * cp - rz * sp;
        const depth = y * sp + rz * cp + camera.distance;
        const scale = 1050 / Math.max(110, depth);
        const px = 800 + (rx * cr - ry * sr) * scale;
        const py = 450 + (rx * sr + ry * cr) * scale;
        return {x: px, y: py, scale, visible: depth > 110 && px > -100 && px < 1700 && py > -100 && py < 1000};
    };
}

