import {clampTime} from "./timeline";
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
    const travel = bounded((time - 8) / 38);
    const overview = ease((time - 36) / 5) * (1 - ease((time - 45) / 5));
    const focus = travel * 1660;
    const zoom = 1 - overview * 0.48;
    return ({x, y, z}) => {
        const depth = z - focus;
        const scale = zoom * 1400 / (1400 + Math.max(-450, depth) * 0.17);
        return {x: 800 + (x + depth * 0.75) * scale, y: 470 + (y - depth * 0.18) * scale, scale};
    };
}

function text(ctx: CanvasRenderingContext2D, value: string, x: number, y: number, size = 20, color = "#e6edf1", align: CanvasTextAlign = "center") {
    ctx.font = `${size}px ${size > 30 ? "Arial" : "monospace"}`;
    ctx.textAlign = align; ctx.fillStyle = color; ctx.fillText(value, x, y);
}

function worldText(ctx: CanvasRenderingContext2D, project: Project, point: Point, value: string, size = 20, color = "#e6edf1") {
    const p = project(point);
    ctx.save(); ctx.translate(p.x, p.y); ctx.scale(p.scale, p.scale);
    text(ctx, value, 0, 0, size, color); ctx.restore();
}

function line(ctx: CanvasRenderingContext2D, project: Project, a: Point, b: Point, color: string, width = 1) {
    const from = project(a), to = project(b);
    ctx.strokeStyle = color; ctx.lineWidth = width;
    ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke();
}

function plane(ctx: CanvasRenderingContext2D, project: Project, z: number, color: string) {
    const corners = [{x: -495, y: -235, z}, {x: 495, y: -235, z}, {x: 495, y: 250, z}, {x: -495, y: 250, z}].map(project);
    ctx.beginPath(); corners.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.closePath();
    ctx.fillStyle = "#11191dfc"; ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.stroke();
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
        const a = project({x: -400 + source * 200, y: -130, z});
        const b = project({x: -400 + target * 200, y: -130, z});
        const strength = MODEL[block].weights[target][source];
        ctx.strokeStyle = active ? COLORS[source] : "#53707b";
        ctx.lineWidth = active ? 1.5 + strength * 5 : 1;
        const lift = (75 + Math.abs(target - source) * 32) * a.scale;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.bezierCurveTo(a.x, a.y - lift, b.x, b.y - lift, b.x, b.y); ctx.stroke();
        if (active) {
            const phase = (time * 1.6 + source * 0.2) % 1;
            const px = a.x + (b.x - a.x) * (3 * phase * phase - 2 * phase ** 3);
            const py = a.y - 3 * lift * phase * (1 - phase);
            ctx.fillStyle = COLORS[source]; ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
        }
    }
    worldText(ctx, project, {x: 0, y: 232, z}, labels.causal, 15, "#8faab6");
}

function network(ctx: CanvasRenderingContext2D, project: Project, block: number, time: number, labels: SceneLabels) {
    const z = block * 430 + 210;
    const active = time >= 12 + block * 9 && time < 16 + block * 9;
    plane(ctx, project, z, "#5d4940");
    worldText(ctx, project, {x: 0, y: -275, z}, labels.feedForward, 34, "#edc5b5");
    worldText(ctx, project, {x: 0, y: 242, z}, labels.shared, 15, "#a39b97");
    for (let token = 0; token < 5; token++) {
        const x = -400 + token * 200;
        for (let column = 0; column < 3; column++) {
            const count = column === 1 ? 10 : 6;
            for (let row = 0; row < count; row++) {
                const point = {x: x + (column - 1) * 49, y: -112 + row * 270 / (count - 1), z};
                if (column < 2) {
                    const nextCount = column === 0 ? 10 : 6;
                    for (let next = 0; next < nextCount; next++) {
                        line(ctx, project, point, {x: x + column * 49, y: -112 + next * 270 / (nextCount - 1), z}, (next + row) % 2 ? "#e78e7052" : "#63baca52", active ? 1.2 : 0.7);
                    }
                }
                const p = project(point);
                ctx.fillStyle = active && (row + column + Math.floor(time * 4)) % 3 === 0 ? COLORS[token] : "#9eafb7";
                ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(1.5, p.scale * 4), 0, Math.PI * 2); ctx.fill();
            }
        }
        worldText(ctx, project, {x, y: -165, z}, labels.tokens[token], 22, COLORS[token]);
        worldText(ctx, project, {x, y: 204, z}, formatActivation(MODEL[block].output[token][0]), 20, COLORS[token]);
        for (const offset of [0, 1]) {
            const fromZ = offset === 0 ? z - 210 : z;
            const toZ = offset === 0 ? z : z + 220;
            if (block === 3 && offset === 1) continue;
            line(ctx, project, {x, y: 160, z: fromZ}, {x, y: 160, z: toZ}, `${COLORS[token]}65`, 1.2);
            if (active) {
                const p = project({x, y: 160, z: fromZ + (toZ - fromZ) * ((time * 0.8) % 1)});
                ctx.fillStyle = COLORS[token]; ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
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

function chat(ctx: CanvasRenderingContext2D, time: number, labels: SceneLabels) {
    const fade = 1 - ease((time - 5) / 2);
    if (fade <= 0) return;
    ctx.save(); ctx.globalAlpha = fade;
    ctx.fillStyle = "#090d10"; ctx.fillRect(0, 0, 1600, 900);
    text(ctx, labels.chat, 800, 300, 46);
    ctx.fillStyle = "#182126"; ctx.strokeStyle = "#43515a"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(300, 360, 1000, 170, 24); ctx.fill(); ctx.stroke();
    const prompt = labels.tokens.join(" ").replace(" ?", "?");
    const typed = prompt.slice(0, Math.floor(bounded((time - 0.5) / 2.6) * prompt.length));
    text(ctx, typed + (time < 3.4 && Math.floor(time * 3) % 2 === 0 ? "│" : ""), 345, 430, 36, "#edf3f5", "left");
    ctx.fillStyle = time > 3.4 ? "#73d1ba" : "#38474d";
    ctx.beginPath(); ctx.roundRect(1170, 442, 85, 56, 12); ctx.fill();
    text(ctx, "↵", 1212, 483, 32, "#091216");
    text(ctx, time > 3.4 ? labels.embeddings : labels.enter, 800, 596, 20, "#94aaaF");
    if (time > 4) labels.tokens.forEach((token, index) => {
        text(ctx, token, 470 + index * 165, 660 + ease((time - 4) / 2) * 40, 28, COLORS[index]);
    });
    ctx.restore();
}

function output(ctx: CanvasRenderingContext2D, time: number, labels: SceneLabels) {
    const fade = ease((time - 48) / 2);
    if (!fade) return;
    ctx.save(); ctx.globalAlpha = fade;
    ctx.fillStyle = "#090d10f5"; ctx.fillRect(0, 0, 1600, 900);
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
    const focus = bounded((time - 8) / 38) * 1660;
    const current = Math.min(3, Math.max(0, Math.floor((time - 7) / 9)));
    const feedForwardActive = time >= 12 + current * 9;
    for (let block = 3; block >= 0; block--) {
        if (block === current) continue;
        const z = block * 430;
        const distance = z - focus;
        ctx.save(); ctx.globalAlpha = distance < -190 ? 0.06 : 0.22;
        plane(ctx, project, z, "#7e969e");
        worldText(ctx, project, {x: 0, y: -275, z}, `${labels.transformer} ${block + 1}`, 24, "#93a7b1");
        for (let token = 0; token < 5; token++) {
            line(ctx, project, {x: -400 + token * 200, y: -130, z}, {x: -400 + token * 200, y: 160, z}, COLORS[token], 3);
        }
        ctx.restore();
    }
    if (feedForwardActive) network(ctx, project, current, time, labels);
    else attention(ctx, project, current, time, labels);
    text(ctx, labels.architecture, 800, 52, 18, "#a1b5bd");
    text(ctx, labels.tokenNote, 45, 835, 17, "#83949e", "left");
    chat(ctx, time, labels);
    output(ctx, time, labels);
    text(ctx, labels.example, 1555, 873, 13, "#74858e", "right");
    ctx.restore();
}
