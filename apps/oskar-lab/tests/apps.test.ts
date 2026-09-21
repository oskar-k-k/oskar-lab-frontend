import {describe, expect, it} from "vitest";
import {isAppPage} from "@/lib/api/apps";

const validPage = {
    content: [{id: 1, path: "chess", title: "Chess", description: null}],
    totalPages: 1,
    totalElements: 1,
    size: 50,
    number: 0,
};

describe("isAppPage", () => {
    it("accepts a complete project page", () => {
        expect(isAppPage(validPage)).toBe(true);
    });

    it("rejects malformed projects at the API boundary", () => {
        expect(isAppPage({...validPage, content: [{id: "1"}]})).toBe(false);
    });
});
