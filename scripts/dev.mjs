import {spawn, spawnSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {appPorts} from "../packages/config/src/next.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const requested = process.argv[2];
const standalone = process.argv.includes("--standalone");
if (requested && !(requested in appPorts)) throw new Error(`Unknown app: ${requested}`);
const selected = requested ? [requested] : Object.keys(appPorts);
const children = [];
let stopping = false;
function stop(code = 0) {
    if (stopping) return;
    stopping = true;
    for (const child of children) {
        if (!child.pid) continue;
        if (process.platform === "win32") spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], {stdio:"ignore"});
        else child.kill();
    }
    process.exitCode = code;
}
for (const name of selected) {
    const child = spawn(process.execPath, [path.join(root, "node_modules/next/dist/bin/next"), "dev", "--port", String(appPorts[name])], {
        cwd: path.join(root, "apps", name), stdio: "inherit",
        env: {...process.env, ...(standalone ? {APP_STANDALONE:"true", NEXT_PUBLIC_PLATFORM_SHELL:"standalone"} : {})},
    });
    children.push(child);
    child.on("error", error => {console.error(error); stop(1);});
    child.on("exit", code => {if (!stopping) stop(code ?? 1);});
}
process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());
