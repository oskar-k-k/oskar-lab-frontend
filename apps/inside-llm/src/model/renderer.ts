import {clampTime, noise} from "./timeline";
import {exampleModel} from "./transformer";
import {formatActivation, OUTPUT_PROBABILITIES} from "./data";
import type {SceneLabels} from "./dataAnnotations";

const MODEL = exampleModel();
const COLORS = ["#6dd5e5", "#a5b8f4", "#eabf78", "#ef927c", "#8bd4ad"];
type Point = {x: number; y: number; z: number};
type Project = (point: Point) => {x: number; y: number; scale: number};
const bounded = (value: number) => Math.max(0, Math.min(1, value));
const ease = (value: number) => {const t = bounded(value); return t * t * (3 - 2 * t);};

function projection(time: number): Project {
    const enter = ease((time - 4) / 6);
    const leave = ease((time - 43) / 7);
    const overview = ease((time - 33) / 5) * (1 - ease((time - 42) / 4));
    const travelFocus = -230 + bounded((time - 7) / 43) * 2100;
    const focus = travelFocus * (1 - overview) + 450 * overview;
    const distance = 2050 - enter * 650 + overview * 2400 + leave * 250;
    const yaw = 0.93 + Math.sin(time / 60 * Math.PI * 2) * 0.09;
    const pitch = 0.24;
    return ({x, y, z}) => {
        const depth = (z - focus) * 1.85;
        const horizontal = x * Math.cos(yaw) + depth * Math.sin(yaw);
        const rotatedDepth = -x * Math.sin(yaw) + depth * Math.cos(yaw);
        const vertical = y * Math.cos(pitch) - rotatedDepth * Math.sin(pitch);
        const cameraDepth = y * Math.sin(pitch) + rotatedDepth * Math.cos(pitch);
        const scale = 1250 / Math.max(650, distance + cameraDepth);
        return {x: 800 + horizontal * scale, y: 440 + vertical * scale, scale};
    };
}

function worldSurface(ctx: CanvasRenderingContext2D, project: Project, point: Point) {
    const origin = project(point);
    const right = project({...point, x: point.x + 1});
    const down = project({...point, y: point.y + 1});
    ctx.transform(right.x - origin.x, right.y - origin.y, down.x - origin.x, down.y - origin.y, origin.x, origin.y);
}

function text(ctx: CanvasRenderingContext2D, value: string, x: number, y: number, size = 20, color = "#e6edf1", align: CanvasTextAlign = "center") {
    ctx.font = `${size}px ${size > 30 ? "Arial" : "monospace"}`;
    ctx.textAlign = align; ctx.fillStyle = color; ctx.fillText(value, x, y);
}

function worldText(ctx: CanvasRenderingContext2D, project: Project, point: Point, value: string, size = 20, color = "#e6edf1") {
    ctx.save(); worldSurface(ctx, project, point);
    text(ctx, value, 0, 0, size, color); ctx.restore();
}

function line(ctx: CanvasRenderingContext2D, project: Project, a: Point, b: Point, color: string, width = 1) {
    const from = project(a), to = project(b);
    ctx.strokeStyle = color; ctx.lineWidth = width;
    ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke();
}

function cable(ctx: CanvasRenderingContext2D, project: Project, from: Point, to: Point, color: string, time: number, seed: number, width = 0.8) {
    const a = project(from), b = project(to);
    const phase = seed * 1.71 + time * 1.25;
    const length = Math.hypot(to.x - from.x, to.y - from.y, to.z - from.z);
    const amplitude = Math.min(26, length * 0.07);
    const control = (fraction: number, offset: number) => project({
        x: from.x + (to.x - from.x) * fraction + Math.sin(phase + offset) * amplitude,
        y: from.y + (to.y - from.y) * fraction + Math.cos(phase * 0.83 + offset) * amplitude,
        z: from.z + (to.z - from.z) * fraction + Math.sin(phase * 0.61 + offset) * amplitude * 0.5,
    });
    const c = control(0.33, 0), d = control(0.67, 1.6);
    ctx.strokeStyle = color; ctx.lineWidth = width;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.bezierCurveTo(c.x, c.y, d.x, d.y, b.x, b.y); ctx.stroke();
    if (seed % 13 === 0) {
        const t = (time * 0.45 + seed * 0.017) % 1, u = 1 - t;
        const x = u ** 3 * a.x + 3 * u * u * t * c.x + 3 * u * t * t * d.x + t ** 3 * b.x;
        const y = u ** 3 * a.y + 3 * u * u * t * c.y + 3 * u * t * t * d.y + t ** 3 * b.y;
        ctx.fillStyle = "#d5f5ff"; ctx.beginPath(); ctx.arc(x, y, 1.7, 0, Math.PI * 2); ctx.fill();
    }
}

function plane(ctx: CanvasRenderingContext2D, project: Project, z: number, color: string) {
    const front = [{x: -495, y: -235, z}, {x: 495, y: -235, z}, {x: 495, y: 250, z}, {x: -495, y: 250, z}];
    const back = front.map(point => ({...point, z: z + 95}));
    const face = (points: Point[], fill: string) => {
        ctx.beginPath(); points.map(project).forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.closePath();
        ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.stroke();
    };
    face(back, "#14232d24");
    face([front[0], back[0], back[1], front[1]], "#648b9830");
    face([front[1], back[1], back[2], front[2]], "#45758b25");
    face(front, "#101c2466");
    for (let i = 0; i < 4; i++) line(ctx, project, front[i], back[i], color);
}

function vectors(ctx: CanvasRenderingContext2D, project: Project, z: number, values: readonly (readonly number[])[], tokens: readonly string[], active: boolean) {
    for (let token = 0; token < values.length; token++) {
        const x = -400 + token * 200;
        const color = COLORS[token];
        worldText(ctx, project, {x, y: -180, z}, tokens[token], 27, color);
        line(ctx, project, {x, y: -163, z}, {x, y: -125, z}, color);
        for (const side of [-1, 1]) {
            const edge = x + side * 64;
            line(ctx, project, {x: edge, y: -116, z}, {x: edge, y: 159, z}, "#a0aeb7");
            for (const y of [-116, 159]) line(ctx, project, {x: edge, y, z}, {x: edge - side * 12, y, z}, "#a0aeb7");
        }
        values[token].forEach((value, row) => {
            const y = -83 + row * 43;
            worldText(ctx, project, {x, y, z}, formatActivation(value), 26, active ? value >= 0 ? color : "#f19c8c" : "#96a3ad");
        });
        worldText(ctx, project, {x, y: 195, z}, "⋮", 24, "#7f909b");
    }
}

function attention(ctx: CanvasRenderingContext2D, project: Project, block: number, time: number, labels: SceneLabels) {
    const z = block * 430;
    const active = time >= 7 + block * 9 && time < 12 + block * 9;
    plane(ctx, project, z, active ? "#65bac9" : "#34434b");
    worldText(ctx, project, {x: 0, y: -325, z}, `${labels.transformer} ${String(block + 1).padStart(2, "0")}`, 19, "#95a4ad");
    worldText(ctx, project, {x: 0, y: -275, z}, labels.attention, 38, "#e8f0f2");
    vectors(ctx, project, z, MODEL[block].input, labels.tokens, active);
    const target = Math.min(4, Math.floor(Math.max(0, time - 7 - block * 9) * 1.05));
    for (let source = 0; source <= target; source++) {
        const strength = MODEL[block].weights[target][source];
        const arcPoint = (phase: number): Point => ({
            x: -400 + source * 200 + (target - source) * 200 * (3 * phase ** 2 - 2 * phase ** 3),
            y: -130 - Math.sin(phase * Math.PI) * (90 + Math.abs(target - source) * 30),
            z: z + Math.sin(phase * Math.PI) * 65,
        });
        for (let step = 1; step <= 24; step++) line(ctx, project, arcPoint((step - 1) / 24), arcPoint(step / 24), active ? COLORS[source] : "#53707b", active ? 1.5 + strength * 3 : 0.7);
        if (active) {
            const p = project(arcPoint((time * 1.6 + source * 0.2) % 1));
            ctx.fillStyle = COLORS[source]; ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
        }
    }
    worldText(ctx, project, {x: 0, y: 232, z}, labels.causal, 15, "#8faab6");
}

function networkPoint(block: number, token: number, column: number, row: number): Point {
    const seed = token * 179 + row * 23 + column * 53;
    const count = column === 1 ? 10 : 6;
    return {
        x: -400 + token * 200 + (noise(seed) - 0.5) * 260,
        y: -125 + row * 290 / (count - 1) + (noise(seed + 9) - 0.5) * 64,
        z: block * 430 + 130 + column * 80 + (noise(seed + 17) - 0.5) * 48,
    };
}

function fan(ctx: CanvasRenderingContext2D, project: Project, from: Point, to: Point, color: string, time: number, offset: number) {
    const pointAt = (t: number): Point => {
        const blend = ease(t);
        return {x: from.x + (to.x - from.x) * blend, y: from.y + (to.y - from.y) * blend + Math.sin(t * Math.PI) * Math.sin(time * 1.2 + offset * 0.7 + t * 3) * 12, z: from.z + (to.z - from.z) * t};
    };
    for (let step = 1; step <= 24; step++) line(ctx, project, pointAt((step - 1) / 24), pointAt(step / 24), `${color}85`, 1);
    const p = project(pointAt((time * 0.35 + offset * 0.037) % 1));
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2); ctx.fill();
}

function billboard(ctx: CanvasRenderingContext2D, project: Project, z: number) {
    const p = project({x: 0, y: 0, z});
    ctx.translate(p.x, p.y); ctx.scale(p.scale * 0.65, p.scale * 0.65); ctx.translate(-800, -450);
}

function network(ctx: CanvasRenderingContext2D, project: Project, block: number, time: number, labels: SceneLabels) {
    const z = block * 430 + 210;
    const active = time >= 12 + block * 9 && time < 16 + block * 9;

    worldText(ctx, project, {x: 0, y: -275, z}, labels.feedForward, 34, "#edc5b5");
    worldText(ctx, project, {x: 0, y: 242, z}, labels.shared, 15, "#a39b97");
    for (let token = 0; token < 5; token++) {
        const x = -400 + token * 200;
        for (let column = 0; column < 3; column++) {
            const count = column === 1 ? 10 : 6;
            for (let row = 0; row < count; row++) {
                const point = networkPoint(block, token, column, row);
                if (column < 2) {
                    const nextCount = column === 0 ? 10 : 6;
                    for (let next = 0; next < nextCount; next++) {
                        cable(ctx, project, point, networkPoint(block, token, column + 1, next), (next + row) % 2 ? "#e78e7070" : "#63baca70", time, block * 701 + token * 131 + column * 61 + row * 13 + next, active ? 1.2 : 0.7);
                    }
                }
                const p = project(point);
                const sphere = ctx.createRadialGradient(p.x - 1.5, p.y - 1.5, 0, p.x, p.y, Math.max(2, p.scale * 5));
                sphere.addColorStop(0, "#ffffff"); sphere.addColorStop(0.4, active ? COLORS[token] : "#a0b9c5"); sphere.addColorStop(1, "#263d48");
                ctx.fillStyle = sphere;
                ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(1.5, p.scale * 4), 0, Math.PI * 2); ctx.fill();
            }
        }
        worldText(ctx, project, {x, y: -165, z}, labels.tokens[token], 22, COLORS[token]);
        worldText(ctx, project, {x, y: 204, z}, formatActivation(MODEL[block].output[token][0]), 20, COLORS[token]);
        for (let row = 0; row < 6; row++) {
            const input = {x, y: -83 + row * 43, z: block * 430 + 95};
            const output = {x, y: -83 + row * 43, z: (block + 1) * 430};
            for (let node = 0; node < 6; node++) {
                cable(ctx, project, input, networkPoint(block, token, 0, node), `${COLORS[token]}45`, time, token * 61 + row * 17 + node);
                if (block < 3) cable(ctx, project, networkPoint(block, token, 2, node), output, `${COLORS[token]}45`, time, token * 67 + row * 19 + node);
            }
        }
    }
    for (const start of [z - 210, z]) {
        const end = start + 200;
        line(ctx, project, {x: -470, y: 190, z: start}, {x: -550, y: 290, z: start}, "#8bd4ad", 1.5);
        line(ctx, project, {x: -550, y: 290, z: start}, {x: -550, y: 290, z: end}, "#8bd4ad", 1.5);
        line(ctx, project, {x: -550, y: 290, z: end}, {x: -470, y: 190, z: end}, "#8bd4ad", 1.5);
        worldText(ctx, project, {x: -470, y: 195, z: end}, "⊕", 24, "#8bd4ad");
    }
    worldText(ctx, project, {x: 0, y: 280, z}, labels.residual, 14, "#8bd4ad");
}

function chat(ctx: CanvasRenderingContext2D, project: Project, time: number, labels: SceneLabels) {
    ctx.save(); billboard(ctx, project, -520);
    text(ctx, labels.chat, 800, 300, 64);
    ctx.fillStyle = "#182126"; ctx.strokeStyle = "#43515a"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(300, 360, 1000, 170, 24); ctx.fill(); ctx.stroke();
    const prompt = labels.tokens.join(" ").replace(" ?", "?");
    const typed = prompt.slice(0, Math.floor(bounded((time - 0.5) / 2.6) * prompt.length));
    text(ctx, typed + (time < 3.4 && Math.floor(time * 3) % 2 === 0 ? "│" : ""), 345, 430, 52, "#edf3f5", "left");
    ctx.fillStyle = time > 3.4 ? "#73d1ba" : "#38474d";
    ctx.beginPath(); ctx.roundRect(1170, 442, 85, 56, 12); ctx.fill();
    text(ctx, "↵", 1212, 483, 32, "#091216");
    text(ctx, time > 3.4 ? labels.embeddings : labels.enter, 800, 596, 20, "#94aaaF");
    if (time > 4) labels.tokens.forEach((token, index) => {
        text(ctx, token, 470 + index * 165, 660 + ease((time - 4) / 2) * 40, 28, COLORS[index]);
    });
    ctx.restore();
}

function output(ctx: CanvasRenderingContext2D, project: Project, time: number, labels: SceneLabels) {
    ctx.save(); billboard(ctx, project, 1850);
    text(ctx, labels.outputPipeline, 800, 95, 20, "#a1b5bd");
    text(ctx, labels.nextToken, 800, 160, 25, "#8bd4ad");
    text(ctx, labels.tokens.join(" ").replace(" ?", "?"), 800, 235, 40);
    const answer = labels.answer.split(" ");
    const selected = Math.min(answer.length, Math.floor(Math.max(0, time - 51) / 1.3));
    text(ctx, answer.slice(0, selected).join(" ") + " ▍", 800, 350, 42, "#8bd4ad");
    ctx.save(); ctx.globalAlpha *= selected > 1 ? 0.15 : 1;
    OUTPUT_PROBABILITIES.forEach((probability, index) => {
        const y = 470 + index * 55;
        text(ctx, labels.candidates[index], 650, y + 6, 25, COLORS[index], "right");
        ctx.fillStyle = `${COLORS[index]}35`; ctx.fillRect(685, y - 20, 330, 30);
        ctx.fillStyle = COLORS[index]; ctx.fillRect(685, y - 20, probability / 100 * 330, 30);
        text(ctx, `${probability}%`, 1090, y + 4, 21, "#ced8dd");
    });
    ctx.restore();
    text(ctx, labels.repeat, 800, 760, 22, "#93a3ad");
    ctx.restore();
}

/** Renders a typed chat entry and a reduced, causal transformer architecture without particle effects. */
export function renderFrame(ctx: CanvasRenderingContext2D, width: number, height: number, value: number, labels: SceneLabels) {
    const time = clampTime(value);
    ctx.save(); ctx.scale(width / 1600, height / 900);
    ctx.fillStyle = "#090d10"; ctx.fillRect(0, 0, 1600, 900);
    const project = projection(time);
    for (let z = -650; z <= 2000; z += 215) {
        line(ctx, project, {x: -650, y: 340, z}, {x: 650, y: 340, z}, "#354d5825");
    }
    for (let x = -600; x <= 600; x += 200) line(ctx, project, {x, y: 340, z: -650}, {x, y: 340, z: 2000}, "#354d5825");
    for (let block = 3; block >= 0; block--) {
        network(ctx, project, block, time, labels);
        attention(ctx, project, block, time, labels);
    }
    for (let token = 0; token < 5; token++) {
        for (let row = 0; row < 6; row++) {
            const endpoint = {x: -400 + token * 200, y: -83 + row * 43, z: 0};
            fan(ctx, project, {x: 0, y: 0, z: -520}, endpoint, COLORS[token], time, token * 6 + row);
            fan(ctx, project, networkPoint(3, token, 2, row), {x: 0, y: 0, z: 1850}, COLORS[token], time, token * 6 + row);
        }
    }
    output(ctx, project, time, labels);
    chat(ctx, project, time, labels);
    text(ctx, labels.example, 1555, 873, 13, "#74858e", "right");
    ctx.restore();
}
