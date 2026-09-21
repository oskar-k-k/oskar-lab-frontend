import {beforeEach, describe, expect, it, vi} from "vitest";
import type {NextAuthConfig} from "next-auth";

const state = vi.hoisted(() => ({config: null as NextAuthConfig | null, request: vi.fn()}));
vi.mock("next-auth", () => ({
    default: (config: NextAuthConfig) => {state.config = config; return {};},
    CredentialsSignin: class extends Error {code = "credentials";},
}));
vi.mock("../src/backend", () => ({
    accountRequest: state.request,
    AccountError: class extends Error {constructor(public code: string, public status: number) {super(code);}},
    parseLogin: (value: unknown) => value,
}));
import "../src/server";

const identity = {id: "internal-id", name: "test_user", email: "test@example.invalid", complete: true, termsVersion: "2026-09-21"};
type JwtArguments = Parameters<NonNullable<NonNullable<NextAuthConfig["callbacks"]>["jwt"]>>[0];
const jwt = (value: Partial<JwtArguments>) => state.config!.callbacks!.jwt!(value as JwtArguments);

beforeEach(() => state.request.mockReset());

describe("platform session security", () => {
    it("does not accept an unverified Google email", async () => {
        expect(await jwt({token: {}, account: {provider: "google", type: "oidc", providerAccountId: "subject"}, profile: {sub: "subject", email: "test@example.invalid", email_verified: false}})).toBeNull();
        expect(state.request).not.toHaveBeenCalled();
    });
    it("requires password confirmation instead of linking a matching email automatically", async () => {
        state.request.mockResolvedValue({linkRequired: true});
        const token = await jwt({token: {}, account: {provider: "google", type: "oidc", providerAccountId: "subject"}, profile: {sub: "subject", email: "test@example.invalid", email_verified: true}});
        expect(token?.pendingGoogle?.subject).toBe("subject");
        expect(token?.backendToken).toBeUndefined();
        expect(token?.identity).toBeUndefined();
    });
    it("never accepts client-supplied identity or session tokens", async () => {
        state.request.mockResolvedValue(identity);
        const token = await jwt({token: {backendToken: "real-token"}, trigger: "update", session: {identity: {...identity, id: "victim"}, backendToken: "forged-token"}});
        expect(state.request).toHaveBeenCalledExactlyOnceWith("current", {}, "real-token");
        expect(token?.identity?.id).toBe("internal-id");
        expect(token?.backendToken).toBe("real-token");
    });
    it("expires pending Google links before they can change an account", async () => {
        expect(await jwt({token: {pendingGoogle: {subject: "s", email: "a@example.invalid", expires: 0}}, trigger: "update", session: {action: "link", password: "test"}})).toBeNull();
        expect(state.request).not.toHaveBeenCalled();
    });
});
