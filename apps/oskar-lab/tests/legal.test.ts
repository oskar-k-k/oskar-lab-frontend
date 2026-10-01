import {describe, expect, it} from "vitest";
import robots from "../src/app/robots";
import config from "../next.config.mjs";
import {legalMessages} from "@oskar-lab/i18n/legal";
import {createAppConfig} from "../../../packages/config/src/next.mjs";

describe("legal page access and indexing", () => {
    it("allows ordinary search crawlers to discover the noindex instruction", () => {
        const rules = robots().rules;
        expect(Array.isArray(rules)).toBe(true);
        const general = (rules as Array<{userAgent: string; disallow: string[]}>).find(rule => rule.userAgent === "*");
        expect(general?.disallow).not.toContain("/impressum");
        expect(general?.disallow).not.toContain("/privacy");
    });
    it("returns noindex headers for every page containing operator information", async () => {
        const rules = await config.headers();
        for (const route of ["/impressum", "/privacy", "/terms"]) {
            expect(rules.find(rule => rule.source === route)?.headers).toContainEqual({key: "X-Robots-Tag", value: "noindex, noarchive, nosnippet"});
        }
    });
    it("makes the imprint reachable from independent app origins", async () => {
        expect(await createAppConfig("chess").redirects()).toEqual(expect.arrayContaining([expect.objectContaining({source: "/impressum", basePath: false})]));
    });
    it("keeps both legal translations complete and aligned", () => {
        expect(Object.keys(legalMessages.en)).toEqual(Object.keys(legalMessages.de));
        expect(legalMessages.en.sections.length).toBe(legalMessages.de.sections.length);
        for (const copy of Object.values(legalMessages)) {
            for (const [title, body] of copy.sections) {
                expect(title.length).toBeGreaterThan(3);
                expect(body.length).toBeGreaterThan(80);
            }
        }
    });
});
