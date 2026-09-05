import "server-only";

import {readdir, readFile} from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

export type DocumentedMember = Readonly<{name: string; signature: string; description: string}>;
export type DocumentedSymbol = Readonly<{
    name: string;
    kind: "class" | "function" | "interface" | "type";
    signature: string;
    description: string;
    members: readonly DocumentedMember[];
}>;
export type SourceDocumentation = Readonly<{path: string; symbols: readonly DocumentedSymbol[]}>;

function commentText(node: ts.Node): string {
    return ts.getJSDocCommentsAndTags(node).map(documentation => {
        const comment = documentation.comment;
        if (typeof comment === "string") return comment;
        return comment?.map(part => part.text).join("") ?? "";
    }).filter(Boolean).join("\n");
}

function compact(text: string): string {
    return text.replace(/\s+/g, " ").trim();
}

function declarationSignature(node: ts.Node, sourceFile: ts.SourceFile): string {
    const hasBody = (
        ts.isFunctionDeclaration(node) ||
        ts.isMethodDeclaration(node) ||
        ts.isGetAccessorDeclaration(node) ||
        ts.isSetAccessorDeclaration(node) ||
        ts.isConstructorDeclaration(node)
    ) && node.body;

    if (hasBody) {
        return compact(sourceFile.text.slice(node.getStart(sourceFile), node.body.getStart(sourceFile)));
    }

    if (ts.isClassDeclaration(node) || ts.isInterfaceDeclaration(node)) {
        const text = node.getText(sourceFile);
        return compact(text.slice(0, text.indexOf("{")));
    }

    return compact(node.getText(sourceFile));
}

function memberDocumentation(member: ts.ClassElement | ts.TypeElement, sourceFile: ts.SourceFile): DocumentedMember | null {
    if (!member.name) return null;
    const modifiers = ts.canHaveModifiers(member) ? ts.getModifiers(member) : undefined;
    if (modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.PrivateKeyword)) return null;
    return {name: member.name.getText(sourceFile), signature: declarationSignature(member, sourceFile), description: commentText(member)};
}

async function sourceFiles(directory: string): Promise<string[]> {
    const entries = await readdir(directory, {withFileTypes: true});
    const nested = await Promise.all(entries.map(entry => {
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) return sourceFiles(entryPath);
        return /\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith(".test.ts") ? [entryPath] : [];
    }));
    return nested.flat();
}

function parseSource(filePath: string, source: string): SourceDocumentation {
    const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, filePath.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    const symbols: DocumentedSymbol[] = [];

    for (const node of sourceFile.statements) {
        let name: string | undefined;
        let kind: DocumentedSymbol["kind"] | undefined;
        let members: readonly DocumentedMember[] = [];

        if (ts.isClassDeclaration(node)) {
            name = node.name?.text;
            kind = "class";
            members = node.members.map(member => memberDocumentation(member, sourceFile)).filter(member => member !== null);
        } else if (ts.isFunctionDeclaration(node)) {
            name = node.name?.text ?? (node.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.DefaultKeyword) ? "default" : undefined);
            kind = "function";
        } else if (ts.isInterfaceDeclaration(node)) {
            name = node.name.text;
            kind = "interface";
            members = node.members.map(member => memberDocumentation(member, sourceFile)).filter(member => member !== null);
        } else if (ts.isTypeAliasDeclaration(node)) {
            name = node.name.text;
            kind = "type";
            if (ts.isTypeLiteralNode(node.type)) {
                members = node.type.members.map(member => memberDocumentation(member, sourceFile)).filter(member => member !== null);
            }
        }

        if (name && kind) symbols.push({name, kind, signature: declarationSignature(node, sourceFile), description: commentText(node), members});
    }

    return {path: path.relative(process.cwd(), filePath).replaceAll("\\", "/"), symbols};
}

async function generateSourceDocumentation(directory: string): Promise<SourceDocumentation[]> {
    const files = await sourceFiles(directory);
    return Promise.all(files.sort().map(async filePath => parseSource(filePath, await readFile(filePath, "utf8"))));
}

/** Generates documentation for all shared Core source files. */
export function generateCoreDocumentation(): Promise<SourceDocumentation[]> {
    return generateSourceDocumentation(path.join(process.cwd(), "src", "core"));
}

/** Generates documentation for all global React components. */
export function generateComponentDocumentation(): Promise<SourceDocumentation[]> {
    return generateSourceDocumentation(path.join(process.cwd(), "src", "components"));
}
