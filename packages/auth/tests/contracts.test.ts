import {describe, expect, it} from "vitest";
import {isIdentity, safeReturnPath} from "../src/contracts";

describe("account boundaries", () => {
    it("rejects external and malformed post-login destinations", () => {
        for (const value of ["https://evil.test", "//evil.test", "/\\evil.test", "/api/auth/signout", "/account", undefined]) expect(safeReturnPath(value)).toBe("/");
        expect(safeReturnPath("/apps/chess?play=1")).toBe("/apps/chess?play=1");
    });
    it("validates complete and incomplete backend identities", () => {
        expect(isIdentity({id: "id", email: "a@b.test", name: null, complete: false, termsVersion: null})).toBe(true);
        expect(isIdentity({id: "id", email: "a@b.test", complete: "true"})).toBe(false);
        expect(isIdentity(null)).toBe(false);
    });
});
