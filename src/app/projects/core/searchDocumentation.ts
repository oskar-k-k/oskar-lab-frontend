import type {DocumentedSymbol, SourceDocumentation} from "@/lib/documentation/sourceDocumentation";

export type SearchReference = Readonly<{id: string; title: string; description: string; keywords: readonly string[]}>;

function includesQuery(values: readonly (string | undefined)[], query: string): boolean {
    const searchableText = values.filter(Boolean).join(" ").toLocaleLowerCase("de");
    return query.split(/\s+/).every(term => searchableText.includes(term));
}

function textScore(value: string | undefined, query: string, weight: number): number {
    const text = value?.toLocaleLowerCase("de") ?? "";
    if (text === query) return weight;
    if (text.startsWith(query)) return weight * .9;
    if (includesQuery([text], query)) return weight * .7;
    return 0;
}

function filterSymbol(symbol: DocumentedSymbol, query: string): {symbol: DocumentedSymbol; score: number} | null {
    const symbolScore = Math.max(
        textScore(symbol.name, query, 1000),
        textScore(symbol.signature, query, 350),
        textScore(symbol.description, query, 250),
        textScore(symbol.kind, query, 200),
    );
    if (symbolScore > 0) return {symbol, score: symbolScore};

    const members = symbol.members.map(member => ({
        member,
        score: Math.max(textScore(member.name, query, 700), textScore(member.signature, query, 220), textScore(member.description, query, 160)),
    })).filter(result => result.score > 0).sort((left, right) => right.score - left.score);
    return members.length > 0 ? {symbol: {...symbol, members: members.map(result => result.member)}, score: members[0].score} : null;
}

/** Filters generated source documentation without changing its file and symbol hierarchy. */
export function filterDocumentation(files: readonly SourceDocumentation[], searchQuery: string): SourceDocumentation[] {
    const query = searchQuery.trim().toLocaleLowerCase("de");
    if (!query) return [...files];

    return files.map(file => {
        const fileName = file.path.split("/").at(-1);
        const pathScore = Math.max(
            textScore(fileName?.replace(/\.tsx?$/, ""), query, 850),
            textScore(fileName, query, 800),
            textScore(file.path, query, 500),
        );
        const symbols = file.symbols.map(symbol => filterSymbol(symbol, query)).filter(result => result !== null).sort((left, right) => right.score - left.score);
        if (pathScore > 0 && symbols.length === 0) return {file, score: pathScore};
        if (symbols.length === 0) return null;
        return {file: {...file, symbols: symbols.map(result => result.symbol)}, score: Math.max(pathScore, symbols[0].score)};
    }).filter(result => result !== null).sort((left, right) => right.score - left.score || left.file.path.localeCompare(right.file.path)).map(result => result.file);
}

/** Filters the manually curated visual design areas shown in the living documentation. */
export function filterReferences<T extends SearchReference>(references: readonly T[], searchQuery: string): T[] {
    const query = searchQuery.trim().toLocaleLowerCase("de");
    if (!query) return [...references];
    return references.filter(reference => includesQuery([reference.title, reference.description, ...reference.keywords], query));
}

/** Counts visible documented symbols for an accessible search result announcement. */
export function countDocumentedSymbols(files: readonly SourceDocumentation[]): number {
    return files.reduce((count, file) => count + file.symbols.length, 0);
}
