import {readFile, writeFile, mkdir} from "node:fs/promises";
import openapiTS, {astToString} from "openapi-typescript";
import ts from "typescript";

const root = new URL("../packages/api/", import.meta.url);
const check = process.argv.includes("--check");
const sync = process.argv.includes("--sync");
const read = async url => JSON.parse(await readFile(url, "utf8"));
const stable = value => Array.isArray(value) ? value.map(stable) : value && typeof value === "object"
    ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, stable(item)])) : value;
async function output(relative, content) {
    const url = new URL(relative, root);
    if (check) {
        if (await readFile(url, "utf8") !== content) throw new Error(`Stale API artifact: ${relative}. Run npm run api:generate.`);
    } else {
        await mkdir(new URL(".", url), {recursive: true});
        await writeFile(url, content);
    }
}
let backend = await read(sync ? new URL("../../backend/build/openapi/backend.json", import.meta.url) : new URL("openapi/backend.json", root));
// Random test-server ports are not part of the versioned contract.
backend = {...backend, servers: [{url: "/"}]};
await output("openapi/backend.json", JSON.stringify(stable(backend), null, 2) + "\n");
const worker = await read(new URL("openapi/worker.json", root));
const browser = await read(new URL("openapi/browser-base.json", root));
browser.components.schemas = {...backend.components.schemas, ...browser.components.schemas};
for (const [path, item] of Object.entries(backend.paths)) {
    const travel = path.startsWith("/internal/travel/trips");
    if (!travel && !path.startsWith("/internal/workout/")) continue;
    const copy = structuredClone(item);
    for (const operation of Object.values(copy)) {
        operation.parameters = operation.parameters?.filter(parameter => parameter.in !== "header");
        operation.security = path.endsWith("/templates") || path.endsWith("/exercises") ? [] : [{sessionCookie: []}];
    }
    browser.paths[travel ? path.replace("/internal/travel/trips", "/api/travel") : path.replace("/internal/workout/", "/api/workout/")] = copy;
}
for (const [name, schema] of Object.entries({backend, browser, worker})) {
    if (name === "browser") await output(`openapi/${name}.json`, JSON.stringify(stable(schema), null, 2) + "\n");
    await output(`src/generated/${name}.ts`, astToString(await openapiTS(stable(schema), {
        transform(node) {
            if (node.format === "binary") return ts.factory.createTypeReferenceNode("Blob");
        },
    })));
}
console.log(check ? "OpenAPI artifacts are current." : "OpenAPI types generated.");
