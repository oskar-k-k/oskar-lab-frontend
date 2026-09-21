import path from "node:path";
import {fileURLToPath} from "node:url";

export const appPorts = {"oskar-lab":10030, chess:10031, "cloth-lab":10032, "neon-vault":10033, portfolio:10034, "core-design":10035};
const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

/** Configures an independently built app and optional platform routing. */
export function createAppConfig(name) {
    const platform = name === "oskar-lab";
    const standalone = process.env.APP_STANDALONE === "true";
    const basePath = platform || standalone ? "" : `/apps/${name}`;
    return {
        basePath,
        distDir: standalone ? ".next-standalone" : ".next",
        allowedDevOrigins: ["127.0.0.1", "localhost"],
        reactCompiler: true,
        transpilePackages: ["@oskar-lab/core", "@oskar-lab/ui", "@oskar-lab/i18n", "@oskar-lab/auth", "@oskar-lab/platform-shell", "@oskar-lab/config"],
        turbopack: {root: workspaceRoot},
        outputFileTracingRoot: workspaceRoot,
        env: {NEXT_PUBLIC_APP_BASE_PATH: basePath},
        async redirects() {
            if (!platform) return ["/account", "/terms", "/privacy"].map(source => ({source, destination:`${process.env.AUTH_PLATFORM_URL ?? "http://127.0.0.1:10030"}${source}`, permanent:false, basePath:false}));
            return [
                {source:"/apps/core/:path*", destination:"/apps/core-design/:path*", permanent:true},
                {source:"/projects/core/:path*", destination:"/apps/core-design/:path*", permanent:true},
                {source:"/projects/:path+", destination:"/apps/:path+", permanent:true},
                {source:"/projects", destination:"/", permanent:true},
                {source:"/apps", destination:"/", permanent:false},
            ];
        },
        async rewrites() {
            if (!platform) return [{source:"/api/auth/:path*", destination:`${process.env.AUTH_PLATFORM_URL ?? "http://127.0.0.1:10030"}/api/auth/:path*`, basePath:false}];
            return Object.entries(appPorts).filter(([id]) => id !== name).map(([id, port]) => ({
                source:`/apps/${id}/:path*`,
                destination:`${process.env[`APP_${id.replaceAll("-", "_").toUpperCase()}_URL`] ?? `http://127.0.0.1:${port}`}/apps/${id}/:path*`,
            }));
        },
    };
}
