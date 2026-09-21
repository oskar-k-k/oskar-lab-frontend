import {describe, expect, it} from "vitest";
import {messages, parseLocale} from "@oskar-lab/i18n/messages";

describe("i18n messages", () => {
    it("uses English as the fallback locale", () => {
        expect(parseLocale(undefined)).toBe("en");
        expect(parseLocale("fr")).toBe("en");
        expect(parseLocale("de")).toBe("de");
    });

    it("keeps both locales structurally aligned", () => {
        expect(Object.keys(messages.de).sort()).toEqual(Object.keys(messages.en).sort());
    });
});
