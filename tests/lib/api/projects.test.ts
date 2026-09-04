import {describe, expect, it} from "vitest";
import {isProjectPage} from "@/lib/api/projects";

const validPage = {
    content: [{id: 1, path: "chess", title: "Chess", description: null}],
    totalPages: 1,
    totalElements: 1,
    size: 50,
    number: 0,
};

describe("isProjectPage", () => {
    it("accepts a complete project page", () => {
        expect(isProjectPage(validPage)).toBe(true);
    });

    it("rejects malformed projects at the API boundary", () => {
        expect(isProjectPage({...validPage, content: [{id: "1"}]})).toBe(false);
    });
});
