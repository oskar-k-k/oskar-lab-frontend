import {noise} from "./timeline";

export const BLOCK_COUNT = 4;
export const VECTOR_SIZE = 6;

/** Small deterministic embeddings for an illustrative, untrained transformer. */
export function exampleEmbeddings(count: number): number[][] {
    return Array.from({length: count}, (_, token) => Array.from({length: VECTOR_SIZE}, (_, row) => (noise(token * 31 + row) - 0.5) * 4));
}

function normalize(vector: readonly number[]): number[] {
    const mean = vector.reduce((sum, value) => sum + value, 0) / vector.length;
    const variance = vector.reduce((sum, value) => sum + (value - mean) ** 2, 0) / vector.length;
    return vector.map(value => (value - mean) / Math.sqrt(variance + 0.00001));
}

/** Applies the same two-layer nonlinear network independently to each token. */
export function feedForward(vector: readonly number[]): number[] {
    const hidden = Array.from({length: 10}, (_, node) => Math.max(0, vector.reduce((sum, value, row) => sum + value * (noise(node * 19 + row) - 0.5), 0)));
    return vector.map((value, row) => value + hidden.reduce((sum, activation, node) => sum + activation * (noise(row * 43 + node) - 0.5), 0) * 0.3);
}

/** Computes causal single-head attention and residual updates; future tokens have zero weight. */
export function transformerBlock(input: readonly (readonly number[])[]) {
    const normalized = input.map(vector => [...vector]);
    const weights = normalized.map((query, target) => {
        const scores = normalized.slice(0, target + 1).map(key => query.reduce((sum, value, row) => sum + value * key[row], 0) / Math.sqrt(VECTOR_SIZE));
        const largest = Math.max(...scores);
        const exponentials = scores.map(score => Math.exp(score - largest));
        const total = exponentials.reduce((sum, value) => sum + value, 0);
        return input.map((_, source) => source <= target ? exponentials[source] / total : 0);
    });
    const attention = input.map((vector, token) => normalize(vector.map((value, row) => value + weights[token].reduce((sum, weight, source) => sum + weight * normalized[source][row], 0))));
    const output = attention.map(vector => normalize(feedForward(vector)));
    return {input, weights, attention, output};
}

/** Returns four reduced blocks with consistent values between adjacent stages. */
export function exampleModel() {
    let vectors = exampleEmbeddings(5);
    return Array.from({length: BLOCK_COUNT}, () => {
        const block = transformerBlock(vectors);
        vectors = block.output;
        return block;
    });
}
