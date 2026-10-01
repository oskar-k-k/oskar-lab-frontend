import type {MetadataRoute} from "next";
/** Lets search crawlers read noindex while asking selected bulk crawlers to skip legal pages. */
export default function robots(): MetadataRoute.Robots {
    return {rules: [
        {userAgent: "*", allow: "/", disallow: ["/api/", "/account"]},
        {userAgent: ["CCBot", "ClaudeBot", "Bytespider"], disallow: ["/impressum", "/privacy", "/terms", "/api/", "/account"]},
    ]};
}
