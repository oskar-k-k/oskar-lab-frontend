export const wordGroups: Record<string, string[]> = {
    food: ["Pizza", "Sushi", "Pommes", "Pasta", "Döner", "Salat", "Pfannkuchen", "Eis", "Burger", "Burrito"],
    dates: ["Kino", "Spaziergang", "Kochen", "Museum", "Picknick", "Konzert", "Brettspiele", "Wandern", "Café", "Bowling"],
    intimacy: ["Missionarsstellung", "Reiterstellung", "Löffelchen", "Doggy Style", "Umgekehrte Reiterstellung", "Im Stehen", "Im Sitzen", "Seitlich", "Lotus", "Schere", "Schmetterling", "Brücke", "Wiege", "Brezel", "Amazonenstellung", "Wiener Auster", "69", "Seitliche 69", "Umgekehrtes Löffelchen", "Elefantenstellung", "Froschstellung", "Sphinx", "Katzenstellung", "T-Kreuz", "X-Stellung", "L-Stellung", "V-Stellung", "Wasserfall", "Schubkarre", "Tanzende Spinne"],
};
export function parseExtraWords(text: string) {
    return text.split(/\r?\n/).map(word => word.trim()).filter(Boolean);
}
export function availableWords(category: string, text: string) {
    return new Set([...(wordGroups[category] ?? []), ...parseExtraWords(text)].map(word => word.toLowerCase())).size;
}
