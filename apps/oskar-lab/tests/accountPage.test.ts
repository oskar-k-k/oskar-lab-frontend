import {beforeEach, describe, expect, it, vi} from "vitest";
import React from "react";

const state = vi.hoisted(() => ({auth: vi.fn(), redirect: vi.fn((path: string) => {throw new Error(`redirect:${path}`);})}));
vi.mock("@oskar-lab/auth/server", () => ({auth: state.auth, authProviders: {google:true}}));
vi.mock("next/navigation", () => ({redirect: state.redirect}));
vi.mock("../src/app/account/AccountForm", () => ({default: () => null}));
import AccountPage from "../src/app/account/page";

beforeEach(() => {vi.stubGlobal("React", React); state.auth.mockReset(); state.redirect.mockClear();});

describe("Google callback account page", () => {
    it("supplies the server session immediately for unfinished onboarding", async () => {
        const session = {user:{id:"user-id", complete:false}, linkRequired:false};
        state.auth.mockResolvedValue(session);
        const page = await AccountPage({searchParams:Promise.resolve({continue:"1",returnTo:"/apps/chess"})});
        expect(page.props.initialSession).toBe(session);
        expect(state.redirect).not.toHaveBeenCalled();
    });
    it("returns completed Google users directly to their app", async () => {
        state.auth.mockResolvedValue({user:{complete:true}});
        await expect(AccountPage({searchParams:Promise.resolve({continue:"1",returnTo:"/apps/chess"})})).rejects.toThrow("redirect:/apps/chess");
    });
    it("keeps the account page accessible outside the login callback", async () => {
        state.auth.mockResolvedValue({user:{complete:true}});
        await AccountPage({searchParams:Promise.resolve({})});
        expect(state.redirect).not.toHaveBeenCalled();
    });
});
