import {readdir, readFile} from "node:fs/promises";
import path from "node:path";
import {describe, expect, it} from "vitest";

async function sources(directory: string): Promise<string[]> {
    const entries = await readdir(directory, {withFileTypes:true});
    const groups = await Promise.all(entries.map(entry => {
        const file = path.join(directory, entry.name);
        return entry.isDirectory() ? sources(file) : /\.(ts|tsx|mjs)$/.test(file) ? [file] : [];
    }));
    return groups.flat();
}

describe("workspace dependency boundaries", () => {
    it("keeps shared packages independent of application aliases and source", async () => {
        for (const name of ["core", "ui", "auth", "i18n", "platform-shell"]) {
            for (const file of await sources(path.resolve("packages", name, "src"))) {
                const source = await readFile(file, "utf8");
                expect(source, file).not.toMatch(/from\s+["'](?:@\/|[^"']*\/apps\/)/);
                if (name === "core") expect(source, file).not.toMatch(/from\s+["'](?:react|next|@oskar-lab\/(?:ui|auth|platform-shell))/);
            }
        }
    });
});
