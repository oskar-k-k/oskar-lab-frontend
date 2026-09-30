import {cameraAt, layerCenter, LAYER_COUNT, particlePosition, type Vector3} from "./choreography";
import {activationValue, formatActivation, OUTPUT_PROBABILITIES} from "./data";
import {tokenJourney} from "./signalJourney";
import type {makeProjection} from "./projection";

/** Localized captions embedded in the model's world coordinates. */
export type SceneLabels = Readonly<{
    prompt: string; tokens: readonly string[]; candidates: readonly string[];
    attention: string; feedForward: string; transformer: string;
    embeddings: string; nextToken: string; example: string; answer: string;
}>;
type Project = ReturnType<typeof makeProjection>;

/** Renders text on the world's XY plane, inheriting camera scale, roll and perspective. */
function worldText(ctx: CanvasRenderingContext2D, project: Project, position: Vector3, text: string, size: number, color: string, align: CanvasTextAlign = "center") {
    const origin = project(position);
    const right = project({...position, x: position.x + 1});
    const down = project({...position, y: position.y + 1});
    if (!origin.visible || origin.scale < 0.25) return;
    ctx.save();
    ctx.transform(right.x - origin.x, right.y - origin.y, down.x - origin.x, down.y - origin.y, origin.x, origin.y);
    ctx.font = `${size}px monospace`;
    ctx.textAlign = align;
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#050813";
    ctx.strokeText(text, 0, 0);
    ctx.fillStyle = color;
    ctx.fillText(text, 0, 0);
    ctx.restore();
}

function paintLayerData(ctx: CanvasRenderingContext2D, time: number, project: Project, labels: SceneLabels) {
    const camera = cameraAt(time);
    for (let layer = 0; layer < LAYER_COUNT; layer++) {
        const x = layerCenter(layer);
        worldText(ctx, project, {x, y: -235, z: 0}, `${labels.transformer} ${String(layer + 1).padStart(2, "0")}`, 20, "#d6baff");
        worldText(ctx, project, {x: x - 38, y: -225, z: -45}, labels.attention, 12, "#6feaff");
        worldText(ctx, project, {x: x + 42, y: -205, z: -45}, labels.feedForward, 12, "#ff9fcd");
        if (Math.abs(x - camera.x) > 470 && camera.distance < 1400) continue;
        const nodes = camera.distance > 1400 ? [7, 67, 107] : [7, 27, 47, 62, 67, 84, 89, 104, 109];
        for (const node of nodes) {
            const position = particlePosition(720 + layer * 120 + node, time);
            const value = activationValue(layer, node, time);
            worldText(ctx, project, {...position, y: position.y - 9}, formatActivation(value), 12, value >= 0 ? "#b0faff" : "#ffbad5");
        }
    }
}

function paintPromptJourney(ctx: CanvasRenderingContext2D, time: number, project: Project, labels: SceneLabels) {
    worldText(ctx, project, {x: -970, y: -240, z: 0}, labels.prompt, 17, "#72eaff");
    worldText(ctx, project, {x: -970, y: -205, z: 0}, labels.tokens.join(" ").replace(" ?", "?"), 27, "#effeff");
    worldText(ctx, project, {x: -970, y: 210, z: 0}, labels.embeddings, 14, "#72eaff");
    for (const [token, text] of labels.tokens.entries()) {
        const {position, progress} = tokenJourney(token, time);
        if (progress >= 1) continue;
        worldText(ctx, project, {...position, y: position.y - 20}, text, 18, ["#b6ffff", "#dbc4ff", "#ffc2e0", "#ffe1a0", "#a9ffdc"][token % 5]);
    }
}

function paintOutput(ctx: CanvasRenderingContext2D, time: number, project: Project, labels: SceneLabels) {
    const x = 970;
    worldText(ctx, project, {x, y: -185, z: 0}, labels.nextToken, 20, "#ffdb9f");
    for (const [index, probability] of OUTPUT_PROBABILITIES.entries()) {
        worldText(ctx, project, {x, y: -120 + index * 36, z: 0}, `${labels.candidates[index]}  ${probability}%`, 19, index === 0 ? "#ffe1a5" : "#c6b3ed");
    }
    if (time >= 49.6) worldText(ctx, project, {x, y: 120, z: 0}, labels.answer, 25, "#fff0cb");
}

/** Draws labels and values as scene geometry, without screen-space label panels. */
export function paintDataAnnotations(ctx: CanvasRenderingContext2D, time: number, project: Project, labels: SceneLabels) {
    ctx.save();
    paintLayerData(ctx, time, project, labels);
    paintPromptJourney(ctx, time, project, labels);
    paintOutput(ctx, time, project, labels);
    ctx.textAlign = "right"; ctx.font = "13px monospace"; ctx.fillStyle = "#9aabc6";
    ctx.fillText(labels.example, 1560, 866);
    ctx.restore();
}
