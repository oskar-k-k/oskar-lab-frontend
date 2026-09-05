import type {DocumentedSymbol, SourceDocumentation} from "@/lib/documentation/sourceDocumentation";

export type DesignReference = Readonly<{title: string; description: string; keywords: readonly string[]}>;

function includesQuery(values: readonly (string | undefined)[], query: string): boolean {
    return values.some(value => value?.toLocaleLowerCase("de").includes(query));
}

function filterSymbol(symbol: DocumentedSymbol, query: string): DocumentedSymbol | null {
    if (includesQuery([symbol.name, symbol.kind, symbol.signature, symbol.description], query)) return symbol;
    const members = symbol.members.filter(member => includesQuery([member.name, member.signature, member.description], query));
    return members.length > 0 ? {...symbol, members} : null;
}

/** Filters generated source documentation without changing its file and symbol hierarchy. */
export function filterDocumentation(files: readonly SourceDocumentation[], searchQuery: string): SourceDocumentation[] {
    const query = searchQuery.trim().toLocaleLowerCase("de");
    if (!query) return [...files];

    return files.flatMap(file => {
        if (file.path.toLocaleLowerCase("de").includes(query)) return [file];
        const symbols = file.symbols.map(symbol => filterSymbol(symbol, query)).filter(symbol => symbol !== null);
        return symbols.length > 0 ? [{...file, symbols}] : [];
    });
}

/** Filters the manually curated visual design areas shown in the living documentation. */
export function filterDesignReferences(references: readonly DesignReference[], searchQuery: string): DesignReference[] {
    const query = searchQuery.trim().toLocaleLowerCase("de");
    if (!query) return [...references];
    return references.filter(reference => includesQuery([reference.title, reference.description, ...reference.keywords], query));
}

/** Counts visible documented symbols for an accessible search result announcement. */
export function countDocumentedSymbols(files: readonly SourceDocumentation[]): number {
    return files.reduce((count, file) => count + file.symbols.length, 0);
}
