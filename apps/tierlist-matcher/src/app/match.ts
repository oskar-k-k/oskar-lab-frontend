/** Similarity across revealed rounds: same tier = 100%, opposite ends = 0%. */
export function matchPercent(a: number[], b: number[], rows: number): number | null {
    const rounds = Math.min(a.length, b.length);
    if (!rounds || rows < 2) return null;
    let distance = 0;
    for (let i = 0; i < rounds; i++) distance += Math.abs(a[i] - b[i]);
    return Math.round(100 * (1 - distance / (rounds * (rows - 1))));
}
