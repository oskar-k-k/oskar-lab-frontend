import {tokenJourney} from "./signalJourney";
import {makeProjection, type ScreenPoint} from "./projection";
import {paintDataAnnotations, type SceneLabels} from "./dataAnnotations";
import {cameraAt, layerCenter, LAYER_COUNT, PARTICLE_COUNT, particlePosition} from "./choreography";
import {clampTime} from "./timeline";

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
    ctx.strokeStyle = "#a39ec30a";
    ctx.lineWidth = 1;
    for (let x = 0; x < 1600; x += 80) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 900); ctx.stroke();
    }
    for (let y = 0; y < 900; y += 80) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1600, y); ctx.stroke();
    }
    ctx.globalAlpha = 1;
}

function strokeLink(ctx: CanvasRenderingContext2D, a: ScreenPoint, b: ScreenPoint, color: string, opacity: number) {
    if (!a.visible || !b.visible) return;
    const distance = Math.hypot(a.x - b.x, a.y - b.y);
    if (distance > 800) return;
    ctx.strokeStyle = color;
    ctx.globalAlpha = opacity;
    ctx.lineWidth = Math.min(3, a.scale * 1.7);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
}

function paintConnections(ctx: CanvasRenderingContext2D, points: ScreenPoint[], time: number) {
    for (let layer = 0; layer < LAYER_COUNT; layer++) {
        const base = 720 + layer * 120;
        for (let node = 0; node < 60; node++) {
            const head = Math.floor(node / 20);
            if (node % 20 < 19) strokeLink(ctx, points[base + node], points[base + node + 1], COLORS[head], 0.65);
            if (node % 4 === 0) strokeLink(ctx, points[base + node], points[base + head * 20 + (node + 7) % 20], COLORS[head], 0.32);
        }
        for (let column = 0; column < 2; column++) {
            for (let node = 0; node < 20; node++) {
                const source = base + 60 + column * 20 + node;
                for (let offset = 0; offset < 3; offset++) {
                    const target = base + 60 + (column + 1) * 20 + (node * 3 + offset * 7) % 20;
                    const strength = 0.22 + 0.18 * Math.sin(time * Math.PI / 0.75 - node * 0.4);
                    strokeLink(ctx, points[source], points[target], offset % 2 === 0 ? COLORS[0] : COLORS[2], strength);
                }
            }
        }
        if (layer < LAYER_COUNT - 1) {
            for (let node = 0; node < 20; node++) {
                for (let branch = 0; branch < 3; branch++) {
                    strokeLink(ctx, points[base + 100 + node], points[base + 120 + (node * 3 + branch * 17) % 60], COLORS[(layer + branch) % 5], 0.14);
                }
            }
        }
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
        if (i >= 720 && i < 1800) {
            ctx.fillStyle = "#eaf7ff";
            ctx.globalAlpha = 0.9;
            ctx.beginPath();
            ctx.arc(point.x, point.y, Math.min(5, 2.5 * point.scale), 0, Math.PI * 2);
            ctx.fill();
        }
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

function paintPromptSignals(ctx: CanvasRenderingContext2D, time: number) {
    glowSprites ??= createGlowSprites();
    const project = makeProjection(cameraAt(time));
    for (let token = 0; token < 5; token++) {
        const journey = tokenJourney(token, time);
        if (journey.progress <= 0 || journey.progress >= 1) continue;
        const position = project(journey.position);
        strokeLink(ctx, project(journey.from), project(journey.to), COLORS[token], 0.95);
        for (const vector of [journey.from, journey.to, journey.position]) {
            const point = project(vector);
            if (!point.visible) continue;
            const size = Math.min(80, 34 * point.scale);
            ctx.globalAlpha = 0.95;
            ctx.drawImage(glowSprites[token], point.x - size / 2, point.y - size / 2, size, size);
        }
        if (position.visible) {
            ctx.fillStyle = "#ffffff";
            ctx.beginPath(); ctx.arc(position.x, position.y, Math.min(6, 4 * position.scale), 0, Math.PI * 2); ctx.fill();
        }
    }
}

/** Draws one continuous model from input to output with a sixty-second camera path. */
export function renderFrame(ctx: CanvasRenderingContext2D, width: number, height: number, value: number, labels: SceneLabels) {
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
    paintPromptSignals(ctx, time);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    const vignette = ctx.createRadialGradient(800, 450, 350, 800, 450, 960);
    vignette.addColorStop(0, "#04030c00");
    vignette.addColorStop(1, "#04030caa");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, 1600, 900);
    paintDataAnnotations(ctx, time, project, labels);
    ctx.restore();
}
