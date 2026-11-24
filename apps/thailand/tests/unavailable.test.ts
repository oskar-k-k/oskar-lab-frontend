import React from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {readFile, writeFile} from "node:fs/promises";
import {expect, it, vi} from "vitest";
import I18nProvider from "@oskar-lab/i18n/I18nProvider";
import DataUnavailable from "../src/app/DataUnavailable";
import styles from "../src/app/DataUnavailable.module.css";

it.each(["en", "de"] as const)("explains recovery in %s with a base-path-aware retry link", async locale => {
    vi.stubGlobal("React", React);
    vi.stubEnv("NEXT_PUBLIC_APP_BASE_PATH", "/apps/thailand");
    try {
        const providerProps = {
            initialLocale: locale,
            children: React.createElement(DataUnavailable),
        };
        const html = renderToStaticMarkup(React.createElement(I18nProvider, providerProps));
        expect(html).toContain("<h1>");
        expect(html).toContain('href="/apps/thailand/"');
        expect(html).toContain(locale === "de" ? "Betreiber" : "site operator");
        if (process.env.THAILAND_RECOVERY_HTML && locale === "de") {
            const css = (await readFile("apps/thailand/src/app/DataUnavailable.module.css", "utf8"))
                .replace(/\.([a-zA-Z][\w-]*)/g, (match, name) => styles[name] ? `.${styles[name]}` : match);
            await writeFile(process.env.THAILAND_RECOVERY_HTML, `<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Travel data recovery preview</title><style>body{margin:0;font:18px/1.6 system-ui}${css}</style>${html}</html>`);
        }
    } finally {
        vi.unstubAllEnvs();
    }
});
