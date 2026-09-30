import {clampTime, noise} from "./timeline";

export type Vector3 = Readonly<{x: number; y: number; z: number}>;
export const PARTICLE_COUNT = 2400;
export const LAYER_COUNT = 9;
export const LAYER_SPACING = 155;
const TAU = Math.PI * 2;
const seeds = Array.from({length: PARTICLE_COUNT}, (_, i) => [noise(i), noise(i + 3000), noise(i + 6000)]);

function smooth(value: number) {
    const clamped = Math.max(0, Math.min(1, value));
    return clamped * clamped * (3 - 2 * clamped);
}

/** Returns a transformer's stable location in the continuous input-to-output scene. */
export function layerCenter(layer: number): number {
    return (layer - (LAYER_COUNT - 1) / 2) * LAYER_SPACING;
}

function travelingSignal(index: number, time: number): Vector3 {
    const [a, b, c] = seeds[index];
    const phase = (a + time * 0.2) % 1;
    const x = -970 + phase * 1940;
    const spread = Math.sin(phase * Math.PI) * 145 + 18;
    const angle = b * TAU + x * 0.006 + time * TAU / 10;
    return {x, y: Math.cos(angle) * spread * c, z: Math.sin(angle) * spread * c};
}

function transformerParticle(index: number, time: number): Vector3 {
    const local = index - 720;
    const layer = Math.floor(local / 120);
    const node = local % 120;
    const ring = Math.floor(node / 30);
    const angle = node % 30 / 30 * TAU + time * TAU / 60 * (ring % 2 === 0 ? 4 : -3) + layer * 0.18;
    const radius = 70 + ring * 41 + Math.sin(time * TAU / 60 * 33 - layer * 0.8) * 7;
    return {x: layerCenter(layer) + Math.sin(angle * 3 + time * TAU / 6) * 15, y: Math.cos(angle) * radius, z: Math.sin(angle) * radius};
}

function outputParticle(index: number, time: number): Vector3 {
    const [a, b, c] = seeds[index];
    const angle = a * TAU + time * TAU / 30;
    const radius = (110 + 55 * Math.cos(angle * 5)) * (0.7 + b * 0.3);
    return {x: 960 + Math.cos(angle) * radius, y: Math.sin(angle) * radius, z: (c - 0.5) * 70};
}

function inputParticle(index: number, time: number): Vector3 {
    const [a, b, c] = seeds[index];
    const angle = a * TAU + time * TAU / 60 * 8;
    return {x: -980 + (b - 0.5) * 90, y: Math.cos(angle) * (90 + c * 55), z: Math.sin(angle) * (90 + c * 55)};
}

/** Keeps the whole model present while colored signals stream through its nine layers. */
export function particlePosition(index: number, value: number): Vector3 {
    const time = clampTime(value);
    if (index < 720) return travelingSignal(index, time);
    if (index < 1800) return transformerParticle(index, time);
    if (index < 2160) return outputParticle(index, time);
    return inputParticle(index, time);
}

const CAMERA_STOPS = [
    {time: 0, x: 0, yaw: 0.38, pitch: -0.3, roll: -0.08, distance: 1800},
    {time: 5, x: -650, yaw: -0.65, pitch: 0.1, roll: 0.12, distance: 1050},
    {time: 10, x: -910, yaw: -0.85, pitch: -0.15, roll: 0, distance: 650},
    {time: 18, x: -450, yaw: -0.55, pitch: 0.2, roll: -0.16, distance: 620},
    {time: 29, x: 100, yaw: 0.55, pitch: -0.25, roll: 0.1, distance: 780},
    {time: 40, x: 590, yaw: -0.5, pitch: 0.25, roll: -0.1, distance: 600},
    {time: 49, x: 950, yaw: -0.95, pitch: -0.15, roll: 0.08, distance: 650},
    {time: 54, x: 350, yaw: -0.3, pitch: -0.1, roll: 0, distance: 1350},
    {time: 60, x: 0, yaw: 0.38, pitch: -0.3, roll: -0.08, distance: 1800},
];

/** Moves along the signal path, then returns to the full-model overview in sixty seconds. */
export function cameraAt(value: number) {
    const time = clampTime(value);
    if (time === 60) {
        const {x, yaw, pitch, roll, distance} = CAMERA_STOPS[0];
        return {x, yaw, pitch, roll, distance};
    }
    const index = Math.min(CAMERA_STOPS.length - 2, CAMERA_STOPS.findLastIndex(stop => time >= stop.time));
    const start = CAMERA_STOPS[index];
    const end = CAMERA_STOPS[index + 1];
    const blend = smooth((time - start.time) / (end.time - start.time));
    return {
        x: start.x + (end.x - start.x) * blend,
        yaw: start.yaw + (end.yaw - start.yaw) * blend,
        pitch: start.pitch + (end.pitch - start.pitch) * blend,
        roll: start.roll + (end.roll - start.roll) * blend,
        distance: start.distance + (end.distance - start.distance) * blend,
    };
}
