import {afterEach, describe, expect, it, vi} from "vitest";
import {createAppConfig} from "../src/next.mjs";
import {appPath} from "../src/paths";

afterEach(() => vi.unstubAllEnvs());

describe("independent app routing", () => {
    it("keeps local login cookies on the configured canonical host", async () => {
        vi.stubEnv("AUTH_URL", "http://localhost:10030");
        expect(await createAppConfig("oskar-lab").redirects()).toContainEqual({source:"/:path*", has:[{type:"host", value:"127\\.0\\.0\\.1"}], destination:"http://localhost:10030/:path*", permanent:false});
    });
    it("isolates app pages and assets under their own base path", () => {
        vi.stubEnv("APP_STANDALONE", "false");
        expect(createAppConfig("chess").basePath).toBe("/apps/chess");
        vi.stubEnv("NEXT_PUBLIC_APP_BASE_PATH", "/apps/cloth-lab");
        expect(appPath("/api/try-on")).toBe("/apps/cloth-lab/api/try-on");
    });

    it("serves the same app at the origin root in standalone mode", () => {
        vi.stubEnv("APP_STANDALONE", "true");
        vi.stubEnv("NEXT_PUBLIC_APP_BASE_PATH", "");
        expect(createAppConfig("cloth-lab").basePath).toBe("");
        expect(appPath("/api/try-on")).toBe("/api/try-on");
    });

    it("routes each product to its own configurable server", async () => {
        vi.stubEnv("APP_CHESS_URL", "http://127.0.0.1:12345");
        const routes = await createAppConfig("oskar-lab").rewrites();
        expect(routes).toContainEqual({source:"/apps/chess/:path*", destination:"http://127.0.0.1:12345/apps/chess/:path*"});
        expect(routes).toHaveLength(5);
    });

    it("preserves the old developer-reference URL", async () => {
        const redirects = await createAppConfig("oskar-lab").redirects();
        expect(redirects).toContainEqual({source:"/projects/core/:path*", destination:"/apps/core-design/:path*", permanent:true});
    });
});
