import {afterEach, expect, it, vi} from "vitest";
import {createAppConfig} from "../src/next.mjs";
afterEach(() => vi.unstubAllEnvs());
it("routes existing public URLs through the migrated allowlist before local assets", async () => {
    vi.stubEnv("ORBIT_ASSETS_ENABLED", "true");
    vi.stubEnv("AUTH_BACKEND_URL", "http://backend:8080");
    const routes = await createAppConfig("oskar-lab").rewrites();
    expect(routes.beforeFiles).toContainEqual({source: "/catalog/:path*", destination: "http://backend:8080/public-assets/oskar-lab/catalog/:path*", basePath: false});
    expect(routes.beforeFiles.some((route: {source:string}) => route.source.includes("documents"))).toBe(false);
});
it("keeps portfolio images base-path aware", async () => {
    vi.stubEnv("ORBIT_ASSETS_ENABLED", "true");
    vi.stubEnv("AUTH_BACKEND_URL", "http://backend:8080");
    const routes = await createAppConfig("portfolio").rewrites();
    expect(routes.beforeFiles).toContainEqual({source: "/apps/portfolio/oskar.jpg", destination: "http://backend:8080/public-assets/portfolio/oskar.jpg", basePath: false});
});
