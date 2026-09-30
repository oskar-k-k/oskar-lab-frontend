import {cameraAt, layerCenter, LAYER_COUNT, PARTICLE_COUNT, particlePosition, type Vector3} from "./choreography";
import {clampTime, noise} from "./timeline";

type ScreenPoint = {x: number; y: number; scale: number; visible: boolean};
type Camera = ReturnType<typeof cameraAt>;
const COLORS = ["#58f7ff", "#a47bff", "#ff529c", "#ffb95a", "#82ffcb"];
let glowSprites: HTMLCanvasElement[] | undefined;

function createGlowSprites(): HTMLCanvasElement[] {
    return COLORS.map(color => {
        const sprite = document.createElement("canvas");
        sprite.width = 64;
        sprite.height = 64;
        const ctx = sprite.getContext("2d");
        if (!ctx) return sprite;
        const glow = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        glow.addColorStop(0, "#ffffff");
        glow.addColorStop(0.08, color);
        glow.addColorStop(0.3, `${color}65`);
        glow.addColorStop(1, `${color}00`);
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, 64, 64);
        return sprite;
    });
}

function makeProjection(camera: Camera) {
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

function paintBackground(ctx: CanvasRenderingContext2D, time: number) {
    ctx.fillStyle = "#04030c";
    ctx.fillRect(0, 0, 1600, 900);
    const colors = ["#501273", "#072a52", "#54122f"];
    for (let i = 0; i < 3; i++) {
        const x = 800 + Math.sin(time * Math.PI / 15 + i * 2) * 520;
        const y = 450 + Math.cos(time * Math.PI / 30 + i * 2) * 260;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 670);
        gradient.addColorStop(0, `${colors[i]}80`);
        gradient.addColorStop(1, `${colors[i]}00`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1600, 900);
    }
    ctx.fillStyle = "#a39ec3";
    for (let i = 0; i < 120; i++) {
        const x = (noise(i + 9000) * 1600 + Math.sin(time * Math.PI / 30) * (12 + i % 4)) % 1600;
        ctx.globalAlpha = 0.12 + noise(i) * 0.35;
        ctx.fillRect(x, noise(i + 9500) * 900, 1.2, 1.2);
    }
    ctx.globalAlpha = 1;
}

function strokeLink(ctx: CanvasRenderingContext2D, a: ScreenPoint, b: ScreenPoint, color: string, opacity: number) {
    if (!a.visible || !b.visible) return;
    const distance = Math.hypot(a.x - b.x, a.y - b.y);
    if (distance > 160) return;
    ctx.strokeStyle = color;
    ctx.globalAlpha = opacity;
    ctx.lineWidth = Math.min(3, a.scale * 1.7);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
}

function paintConnections(ctx: CanvasRenderingContext2D, points: ScreenPoint[], time: number) {
    for (let i = 720; i < 1800; i++) {
        const layer = Math.floor((i - 720) / 120);
        const color = COLORS[layer % COLORS.length];
        const energy = 0.3 + 0.25 * Math.sin(time * Math.PI / 0.75 - layer * 0.9);
        if ((i - 720) % 30 < 29) strokeLink(ctx, points[i], points[i + 1], color, 0.8);
        if ((i - 720) % 120 < 90) strokeLink(ctx, points[i], points[i + 30], color, 0.4);
        if (i < 1680 && i % 4 === 0) strokeLink(ctx, points[i], points[i + 120], color, energy);
    }
}

function paintParticles(ctx: CanvasRenderingContext2D, points: ScreenPoint[], time: number) {
    glowSprites ??= createGlowSprites();
    const previousProjection = makeProjection(cameraAt(Math.max(0, time - 0.035)));
    for (let i = 0; i < points.length; i++) {
        const point = points[i];
        if (!point.visible) continue;
        const colorIndex = i < 720 ? Math.floor(i / 144) : i < 1800 ? Math.floor((i - 720) / 120) % COLORS.length : i < 2160 ? 3 : 0;
        const bright = 0.5 + 0.5 * Math.sin(time * Math.PI / 0.75 - i * 0.035);
        const size = Math.min(52, (12 + bright * 10) * point.scale);
        if (i < 720 || i % 3 === 0) {
            const previous = previousProjection(particlePosition(i, Math.max(0, time - 0.035)));
            strokeLink(ctx, previous, point, COLORS[colorIndex], 0.5);
        }
        ctx.globalAlpha = Math.min(0.95, 0.3 + point.scale * 0.26 + bright * 0.25);
        ctx.drawImage(glowSprites[colorIndex], point.x - size / 2, point.y - size / 2, size, size);
    }
    ctx.globalAlpha = 1;
}

function paintArchitecture(ctx: CanvasRenderingContext2D, time: number) {
    const project = makeProjection(cameraAt(time));
    for (let layer = 0; layer < LAYER_COUNT; layer++) {
        const x = layerCenter(layer);
        const color = COLORS[layer % COLORS.length];
        const corners = [{x, y: -215, z: -215}, {x, y: 215, z: -215}, {x, y: 215, z: 215}, {x, y: -215, z: 215}].map(project);
        if (corners.every(point => point.visible)) {
            ctx.globalAlpha = 0.028;
            ctx.fillStyle = color;
            ctx.beginPath();
            corners.forEach((point, index) => index === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y));
            ctx.closePath();
            ctx.fill();
        }
        for (let ring = 0; ring < 2; ring++) {
            let previous: ScreenPoint | undefined;
            for (let i = 0; i <= 80; i++) {
                const angle = i / 80 * Math.PI * 2;
                const radius = 214 + ring * 11;
                const point = project({x: x + ring * 8, y: Math.cos(angle) * radius, z: Math.sin(angle) * radius});
                if (previous) strokeLink(ctx, previous, point, color, 0.7);
                previous = point;
            }
        }
    }
}

function paintSignalRibbons(ctx: CanvasRenderingContext2D, time: number) {
    const project = makeProjection(cameraAt(time));
    for (let ribbon = 0; ribbon < 5; ribbon++) {
        let previous: ScreenPoint | undefined;
        for (let step = 0; step <= 120; step++) {
            const phase = step / 120;
            const angle = phase * 13 - time * Math.PI / 1.5 + ribbon * Math.PI * 0.4;
            const radius = Math.sin(phase * Math.PI) * 105;
            const point = project({x: -970 + phase * 1940, y: Math.sin(angle) * radius, z: Math.cos(angle) * radius});
            if (previous) strokeLink(ctx, previous, point, COLORS[ribbon], 0.58);
            previous = point;
        }
    }
}

function paintEndpoints(ctx: CanvasRenderingContext2D, time: number, labels: readonly string[]) {
    const project = makeProjection(cameraAt(time));
    for (const [index, x] of [-980, 960].entries()) {
        const point = project({x, y: -255, z: 0});
        if (!point.visible) continue;
        ctx.globalAlpha = 0.78;
        ctx.textAlign = "center";
        ctx.font = `${Math.min(23, Math.max(14, point.scale * 19))}px sans-serif`;
        ctx.fillStyle = index === 0 ? COLORS[0] : COLORS[3];
        ctx.fillText(labels[index], point.x, point.y);
    }
    ctx.globalAlpha = 1;
}

/** Draws one continuous model from input to output with a sixty-second camera path. */
export function renderFrame(ctx: CanvasRenderingContext2D, width: number, height: number, value: number, labels: readonly string[]) {
    const time = clampTime(value);
    ctx.save();
    ctx.scale(width / 1600, height / 900);
    paintBackground(ctx, time);
    const project = makeProjection(cameraAt(time));
    const points = Array.from({length: PARTICLE_COUNT}, (_, i) => project(particlePosition(i, time)));
    ctx.globalCompositeOperation = "lighter";
    paintArchitecture(ctx, time);
    paintConnections(ctx, points, time);
    paintSignalRibbons(ctx, time);
    paintParticles(ctx, points, time);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    const vignette = ctx.createRadialGradient(800, 450, 350, 800, 450, 960);
    vignette.addColorStop(0, "#04030c00");
    vignette.addColorStop(1, "#04030caa");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, 1600, 900);
    paintEndpoints(ctx, time, labels);
    ctx.restore();
}
