import {afterEach, beforeEach, expect, it, vi} from "vitest";
import {mkdtemp, rm, writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import path from "node:path";

vi.mock("server-only", () => ({}));
import {GET} from "../src/app/health/route";

let directory: string;
beforeEach(async () => {
    directory = await mkdtemp(path.join(tmpdir(), "thailand-health-"));
    vi.stubEnv("THAILAND_DATA_DIR", directory);
});
afterEach(async () => {
    vi.unstubAllEnvs();
    await rm(directory, {recursive: true, force: true});
});

it("reports readiness when the private index is readable", async () => {
    await writeFile(path.join(directory, "trip.json"), "{}");
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.text()).toBe("ok");
});

it("reports a missing index without leaking filesystem details", async () => {
    const response = await GET();
    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.text()).toBe("unavailable");
});
