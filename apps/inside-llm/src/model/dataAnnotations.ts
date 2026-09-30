/** Localized labels for the reduced transformer scene. */
export type SceneLabels = Readonly<{
    debug: readonly string[]; inputTokens: number; outputTokens: number; prompt: string; tokens: readonly string[]; candidates: readonly string[];
    attention: string; feedForward: string; transformer: string;
    embeddings: string; nextToken: string; example: string; answer: string;
    chat: string; enter: string; tokenNote: string; causal: string; shared: string;
    residual: string; output: string; repeat: string; architecture: string; outputPipeline: string;
}>;
