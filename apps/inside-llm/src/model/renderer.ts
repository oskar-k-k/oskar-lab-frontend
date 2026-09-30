import {filmState, noise} from "./timeline";

type Point = {x: number; y: number; scale: number};
const CYAN = "103,224,244";
const GOLD = "255,195,128";

function dot(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string, alpha: number) {
    ctx.fillStyle = `rgba(${color},${alpha})`;
    ctx.beginPath(); ctx.arc(x, y, Math.max(0.2, radius), 0, Math.PI * 2); ctx.fill();
}

function line(ctx: CanvasRenderingContext2D, a: Point, b: Point, alpha: number, color = CYAN) {
    ctx.strokeStyle = `rgba(${color},${alpha})`; ctx.lineWidth = 0.65;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
}

function project(x: number, y: number, z: number, time: number, chapter: number): Point {
    const travel = chapter === 2 ? Math.sin((time - 26) / 17 * Math.PI) : 0;
    const angle = -0.47 + Math.sin(time * 0.025) * 0.13 - travel * 0.55;
    const turnX = x * Math.cos(angle) + z * Math.sin(angle);
    const turnZ = z * Math.cos(angle) - x * Math.sin(angle);
    const zoom = chapter === 2 ? 1 + travel * 0.85 : chapter === 5 ? 1.1 - filmState(time).progress * 0.4 : 1;
    const scale = 760 / (1050 + turnZ) * zoom;
    return {x: 800 + turnX * scale, y: 418 + (y + turnZ * 0.17) * scale, scale};
}

function background(ctx: CanvasRenderingContext2D, time: number) {
    ctx.fillStyle = "#050b13"; ctx.fillRect(0, 0, 1600, 900);
    const glow = ctx.createRadialGradient(830, 415, 20, 830, 415, 740);
    glow.addColorStop(0, "#0b2735"); glow.addColorStop(0.5, "#081723"); glow.addColorStop(1, "#050b13");
    ctx.fillStyle = glow; ctx.fillRect(0, 0, 1600, 900);
    for (let i = 0; i < 210; i++) {
        const x = (noise(i) * 1600 + time * (0.3 + noise(i + 500))) % 1600;
        const y = noise(i + 900) * 900;
        dot(ctx, x, y, noise(i + 600) * 1.2 + 0.3, CYAN, 0.1 + noise(i + 100) * 0.3);
    }
    ctx.strokeStyle = "rgba(103,224,244,0.035)"; ctx.lineWidth = 1;
    for (let x = -1200; x <= 2800; x += 140) {
        ctx.beginPath(); ctx.moveTo(800 + (x - 800) * 0.2, 490); ctx.lineTo(x, 900); ctx.stroke();
    }
    for (let i = 0; i < 9; i++) {
        const y = 490 + i * i * 6.2;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1600, y); ctx.stroke();
    }
}

function network(ctx: CanvasRenderingContext2D, time: number, chapter: number) {
    const layers: Point[][] = [];
    for (let layer = 0; layer < 12; layer++) {
        const points: Point[] = [];
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 7; col++) points.push(project((layer - 5.5) * 119, (row - 4) * 48, (col - 3) * 47, time, chapter));
        }
        layers.push(points);
    }
    const pulse = (time * 0.75) % 12;
    for (let layer = 0; layer < 12; layer++) {
        const points = layers[layer];
        const energy = Math.exp(-Math.pow(layer - pulse, 2) / 1.1);
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            if (i % 7 < 6) line(ctx, point, points[i + 1], 0.11);
            if (i < 56) line(ctx, point, points[i + 7], 0.11);
            if (layer < 11 && i % 3 === 0) {
                const next = layers[layer + 1][(i * 11 + layer * 7) % 63];
                line(ctx, point, next, 0.10 + energy * 0.28, layer > 8 ? GOLD : CYAN);
                const flow = (time * 0.65 + noise(i + layer * 60)) % 1;
                dot(ctx, point.x + (next.x - point.x) * flow, point.y + (next.y - point.y) * flow, 1.8, CYAN, 0.2 + energy * 0.6);
            }
            dot(ctx, point.x, point.y, (1.9 + energy * 2.4) * point.scale, layer > 8 ? GOLD : CYAN, 0.4 + energy * 0.6);
            if (energy > 0.35) dot(ctx, point.x, point.y, 7 * point.scale, CYAN, energy * 0.04);
        }
        const top = project((layer - 5.5) * 119, -243, -141, time, chapter);
        ctx.font = "11px monospace"; ctx.fillStyle = `rgba(${CYAN},0.45)`;
        ctx.fillText(String(layer + 1).padStart(2, "0"), top.x, top.y);
    }
}

function vectors(ctx: CanvasRenderingContext2D, time: number) {
    for (let column = 0; column < 9; column++) {
        const x = 325 + column * 118;
        for (let row = 0; row < 15; row++) {
            const value = noise(column * 31 + row);
            const wave = (Math.sin(time * 1.7 - row * 0.42 + column) + 1) / 2;
            ctx.fillStyle = `rgba(${column === 4 ? GOLD : CYAN},${0.15 + wave * 0.65})`;
            ctx.font = "16px monospace";
            ctx.fillText((value * 2 - 1).toFixed(3), x, 230 + row * 24);
        }
        ctx.strokeStyle = `rgba(${CYAN},0.22)`; ctx.strokeRect(x - 15, 198, 90, 405);
    }
}

function attention(ctx: CanvasRenderingContext2D, time: number) {
    const progress = filmState(time).progress;
    for (let head = 0; head < 3; head++) {
        const center = 430 + head * 370;
        const color = head === 1 ? GOLD : CYAN;
        for (let row = 0; row < 7; row++) {
            for (let col = 0; col <= row; col++) {
                const strength = noise(row * 7 + col + head * 51);
                const wave = 0.7 + Math.sin(time * 1.5 + row) * 0.3;
                ctx.fillStyle = `rgba(${color},${0.07 + strength * wave * 0.7})`;
                ctx.fillRect(center - 105 + col * 29, 310 + row * 29, 24, 24);
            }
        }
        for (let i = 0; i < 7; i++) {
            const x = center - 112 + i * 36;
            dot(ctx, x, 250, 4, color, 0.9);
            for (let j = 0; j <= i; j++) {
                ctx.strokeStyle = `rgba(${color},${0.08 + noise(i * 7 + j + head) * 0.28})`;
                ctx.beginPath(); ctx.moveTo(x, 250);
                ctx.quadraticCurveTo((x + center - 112 + j * 36) / 2, 95 + (i - j) * 12, center - 112 + j * 36, 250); ctx.stroke();
            }
        }
        const active = Math.min(6, Math.floor(progress * 7));
        ctx.strokeStyle = `rgba(${color},0.8)`; ctx.strokeRect(center - 109, 306 + active * 29, 210, 31);
    }
}

/** Renders a deterministic frame in a logical 1600×900 space, independent of display size. */
export function renderFrame(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
    ctx.save(); ctx.scale(width / 1600, height / 900);
    const {chapter} = filmState(time);
    background(ctx, time);
    if (chapter === 1) vectors(ctx, time);
    else if (chapter === 3) attention(ctx, time);
    else {
        ctx.globalAlpha = chapter === 0 ? 0.56 : chapter === 4 ? 0.22 : chapter === 5 ? 0.45 : 1;
        network(ctx, time, chapter);
        ctx.globalAlpha = 1;
    }
    const vignette = ctx.createRadialGradient(800, 420, 330, 800, 420, 920);
    vignette.addColorStop(0, "transparent"); vignette.addColorStop(1, "rgba(2,5,11,0.75)");
    ctx.fillStyle = vignette; ctx.fillRect(0, 0, 1600, 900);
    ctx.restore();
}
