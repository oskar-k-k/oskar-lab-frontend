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
        vi.stubEnv("APP_ROOM_STUDIO_URL", undefined);
        vi.stubEnv("APP_2D_LAB_URL", undefined);
        vi.stubEnv("APP_INSIDE_LLM_URL", undefined);
        vi.stubEnv("APP_TIERLIST_MATCHER_URL", undefined);
        const routes = await createAppConfig("oskar-lab").rewrites();
        expect(routes).toContainEqual({source:"/apps/chess/:path*", destination:"http://127.0.0.1:12345/apps/chess/:path*"});
        expect(routes).toContainEqual({source:"/apps/room-studio/:path*", destination:"http://127.0.0.1:10037/apps/room-studio/:path*"});
        expect(routes).toContainEqual({source:"/apps/2d-lab/:path*", destination:"http://127.0.0.1:10038/apps/2d-lab/:path*"});
        expect(routes).toContainEqual({source:"/apps/inside-llm/:path*", destination:"http://127.0.0.1:10039/apps/inside-llm/:path*"});
        expect(routes).toContainEqual({source:"/apps/tierlist-matcher/:path*", destination:"http://127.0.0.1:10040/apps/tierlist-matcher/:path*"});
        expect(routes).toContainEqual({source:"/apps/thailand/:path*", destination:"http://127.0.0.1:10041/apps/thailand/:path*"});
        expect(routes).toHaveLength(11);
    });

    it("preserves the old developer-reference URL", async () => {
        const redirects = await createAppConfig("oskar-lab").redirects();
        expect(redirects).toContainEqual({source:"/projects/core/:path*", destination:"/apps/core-design/:path*", permanent:true});
    });
});
