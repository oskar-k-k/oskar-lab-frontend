import {cameraAt, layerCenter, LAYER_COUNT} from "./choreography";
import {activationValue, formatActivation, OUTPUT_PROBABILITIES} from "./data";
import type {makeProjection} from "./projection";

/** Localized captions for the illustrative data carried through the scene. */
export type SceneLabels = Readonly<{
    prompt: string; tokens: readonly string[]; candidates: readonly string[];
    attention: string; feedForward: string; transformer: string;
    embeddings: string; nextToken: string; example: string;
}>;
type Project = ReturnType<typeof makeProjection>;

function panel(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string) {
    ctx.fillStyle = "#080d1bed";
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(x, y, width, height, 7); ctx.fill(); ctx.stroke();
}

function paintPrompt(ctx: CanvasRenderingContext2D, time: number, labels: SceneLabels) {
    ctx.textAlign = "left";
    ctx.font = "15px monospace";
    ctx.fillStyle = "#9babc5";
    ctx.fillText(labels.prompt, 36, 38);
    let x = 36;
    const active = Math.floor(time * 2) % labels.tokens.length;
    for (const [index, token] of labels.tokens.entries()) {
        ctx.font = "23px monospace";
        const width = ctx.measureText(token).width + 26;
        panel(ctx, x, 53, width, 43, index === active ? "#58f7ff" : "#39465f");
        ctx.fillStyle = index === active ? "#b6fcff" : "#d5deef";
        ctx.fillText(token, x + 13, 81);
        x += width + 8;
    }
    ctx.fillStyle = "#ffbf74";
    ctx.fillText(time >= 48 ? `→ ${labels.candidates[0]}` : "→ ?", x + 8, 81);
}

function paintVector(ctx: CanvasRenderingContext2D, layer: number, time: number, x: number, y: number, scale: number) {
    ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
    panel(ctx, -45, -82, 90, 164, "#667c9b88");
    ctx.strokeStyle = "#9eb4d0";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-28, -64); ctx.lineTo(-36, -64); ctx.lineTo(-36, 63); ctx.lineTo(-28, 63);
    ctx.moveTo(28, -64); ctx.lineTo(36, -64); ctx.lineTo(36, 63); ctx.lineTo(28, 63);
    ctx.stroke();
    ctx.font = "17px monospace"; ctx.textAlign = "center";
    for (let row = 0; row < 5; row++) {
        const value = activationValue(layer, row, time);
        ctx.fillStyle = value >= 0 ? "#92f3ff" : "#ffa0bf";
        ctx.fillText(formatActivation(value), 0, -44 + row * 24);
    }
    ctx.restore();
}

function paintLayerData(ctx: CanvasRenderingContext2D, time: number, project: Project, labels: SceneLabels) {
    const camera = cameraAt(time);
    const nearby = Array.from({length: LAYER_COUNT}, (_, layer) => layer)
        .sort((a, b) => Math.abs(layerCenter(a) - camera.x) - Math.abs(layerCenter(b) - camera.x));
    const labelBounds: {x: number; y: number}[] = [];
    for (const layer of nearby) {
        const center = project({x: layerCenter(layer), y: -245, z: 0});
        if (!center.visible || center.x < 110 || center.x > 1490) continue;
        const y = Math.max(150, Math.min(600, center.y));
        const detailed = Math.abs(layerCenter(layer) - camera.x) < 340 || camera.distance > 1500;
        if (!detailed || labelBounds.some(other => Math.abs(other.x - center.x) < 280 && Math.abs(other.y - y) < 100)) continue;
        labelBounds.push({x: center.x, y});
        panel(ctx, center.x - 130, y - 51, 260, 75, "#b090e499");
        ctx.textAlign = "center";
        ctx.font = "15px monospace"; ctx.fillStyle = "#c2a8fa";
        ctx.fillText(`${labels.transformer} ${String(layer + 1).padStart(2, "0")}`, center.x, y - 26);
        ctx.font = "19px sans-serif"; ctx.fillStyle = "#f2eeff";
        ctx.fillText(`${labels.attention} → ${labels.feedForward}`, center.x, y + 3);
        if (labelBounds.length >= 3) break;
    }
    const vectorBounds: {x: number; y: number; width: number; height: number}[] = [];
    for (const layer of nearby.slice(0, camera.distance > 1400 ? 2 : 1)) {
        const anchor = project({x: layerCenter(layer), y: 130, z: -75});
        if (!anchor.visible) continue;
        const scale = Math.min(1.25, Math.max(0.85, anchor.scale * 0.85));
        for (const side of [-1, 1]) {
            const x = anchor.x + side * 57 * scale;
            const y = Math.min(740, Math.max(330, anchor.y + 60));
            const width = 100 * scale;
            const height = 174 * scale;
            if (x < width || x > 1600 - width || vectorBounds.some(other => Math.abs(other.x - x) < (other.width + width) / 2 && Math.abs(other.y - y) < (other.height + height) / 2)) continue;
            vectorBounds.push({x, y, width, height});
            ctx.strokeStyle = "#96bfe755";
            ctx.beginPath(); ctx.moveTo(anchor.x, anchor.y); ctx.lineTo(x, y - 82 * scale); ctx.stroke();
            paintVector(ctx, layer * 2 + (side === 1 ? 1 : 0), time, x, y, scale);
        }
    }
}

function paintInput(ctx: CanvasRenderingContext2D, project: Project, labels: SceneLabels) {
    const point = project({x: -980, y: 195, z: 0});
    if (!point.visible || point.x < 90 || point.x > 1450 || point.y > 700) return;
    ctx.font = "20px monospace"; ctx.textAlign = "center"; ctx.fillStyle = "#8eefff";
    ctx.fillText(labels.embeddings, point.x, point.y);
    paintVector(ctx, 0, 0, point.x, point.y + 78, 0.66);
}

function paintOutput(ctx: CanvasRenderingContext2D, time: number, project: Project, labels: SceneLabels) {
    const camera = cameraAt(time);
    if (camera.x < 650 && camera.distance < 1500) return;
    const anchor = project({x: 960, y: 0, z: 0});
    if (!anchor.visible) return;
    const x = Math.min(1310, Math.max(990, anchor.x + 45));
    const y = Math.min(610, Math.max(220, anchor.y - 90));
    ctx.strokeStyle = "#ffbf7470";
    ctx.beginPath(); ctx.moveTo(anchor.x, anchor.y); ctx.lineTo(x, y + 80); ctx.stroke();
    panel(ctx, x, y, 258, 203, "#d9a45d");
    ctx.textAlign = "left"; ctx.font = "17px monospace"; ctx.fillStyle = "#ffd098";
    ctx.fillText(labels.nextToken, x + 16, y + 29);
    for (const [index, probability] of OUTPUT_PROBABILITIES.entries()) {
        const rowY = y + 61 + index * 32;
        ctx.font = "20px monospace"; ctx.fillStyle = index === 0 ? "#ffdfa8" : "#d7def0";
        ctx.fillText(labels.candidates[index], x + 16, rowY);
        ctx.fillStyle = index === 0 ? "#ffc979" : "#a78cff";
        ctx.fillRect(x + 107, rowY - 13, probability * 1.25, 12);
        ctx.font = "16px monospace"; ctx.fillStyle = "#d7def0";
        ctx.fillText(`${probability}%`, x + 201, rowY);
    }
}

/** Anchors readable numbers, block labels and example token predictions to the moving model. */
export function paintDataAnnotations(ctx: CanvasRenderingContext2D, time: number, project: Project, labels: SceneLabels) {
    ctx.save();
    paintLayerData(ctx, time, project, labels);
    paintInput(ctx, project, labels);
    paintOutput(ctx, time, project, labels);
    paintPrompt(ctx, time, labels);
    ctx.textAlign = "right"; ctx.font = "13px monospace"; ctx.fillStyle = "#9aabc6";
    ctx.fillText(labels.example, 1560, 866);
    ctx.restore();
}
