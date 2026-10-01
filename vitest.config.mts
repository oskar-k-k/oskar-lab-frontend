import {fileURLToPath} from "node:url";
import {defineConfig} from "vitest/config";

export default defineConfig({
    resolve: {alias: [
        {find:"@/app", replacement:fileURLToPath(new URL("./apps/chess/src/app", import.meta.url))},
        {find:"@/lib/api", replacement:fileURLToPath(new URL("./apps/oskar-lab/src/lib/api", import.meta.url))},
        {find:"@/lib/documentation", replacement:fileURLToPath(new URL("./apps/core-design/src/lib/documentation", import.meta.url))},
    ]},
    test: {environment:"node", include:["apps/**/*.test.ts", "packages/**/*.test.ts"], exclude:["**/node_modules/**","**/.next/**"]},
});
