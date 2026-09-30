import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { expect, it } from "vitest";

function sources(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? sources(path.join(directory, entry.name))
      : [path.join(directory, entry.name)],
  );
}
it("keeps Mesh2D independent of apps, Three.js, Next.js and browser persistence", () => {
  const root = fileURLToPath(new URL("../src", import.meta.url));
  for (const file of sources(root)) {
    const source = readFileSync(file, "utf8");
    expect(source).not.toMatch(
      /from ["'][^"']*(?:apps\/|room-studio|three|next\/)/,
    );
    expect(source).not.toMatch(/localStorage|sessionStorage/);
    if (file.includes(`${path.sep}model${path.sep}`))
      expect(source).not.toMatch(/from ["']react|window\.|document\./);
  }
});
