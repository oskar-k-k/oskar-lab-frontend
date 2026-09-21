import type {} from "./types";
import NextAuth, {CredentialsSignin} from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import {AccountError, accountRequest, parseLogin} from "./backend";
import {isIdentity} from "./contracts";

const googleClientId = process.env.AUTH_GOOGLE_ID;
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET;
export const authProviders = {google: Boolean(googleClientId && googleClientSecret)} as const;

class LoginFailure extends CredentialsSignin {
    constructor(code: "rateLimited" | "unavailable") { super(); this.code = code; }
}

export const {handlers, auth, signIn, signOut} = NextAuth({
    secret: process.env.AUTH_SECRET,
    pages: {signIn: "/account", error: "/account"},
    session: {strategy: "jwt", maxAge: 7 * 24 * 60 * 60},
    providers: [
        Credentials({
            credentials: {identifier: {}, password: {}},
            async authorize(credentials) {
                if (typeof credentials.identifier !== "string" || typeof credentials.password !== "string") return null;
                try {
                    const login = parseLogin(await accountRequest("login", {identifier: credentials.identifier, password: credentials.password}));
                    return {...login.user, backendToken: login.token};
                } catch (error) {
                    if (error instanceof AccountError && error.status === 401) return null;
                    throw new LoginFailure(error instanceof AccountError && error.status === 429 ? "rateLimited" : "unavailable");
                }
            },
        }),
        ...(authProviders.google ? [Google({clientId: googleClientId!, clientSecret: googleClientSecret!})] : []),
    ],
    callbacks: {
        async jwt({token, user, account, profile, trigger, session}) {
            if (account?.provider === "credentials" && user && "backendToken" in user) {
                token.backendToken = user.backendToken as string;
                token.provider = "credentials";
                delete token.pendingGoogle;
            }
            if (account?.provider === "google") {
                if (!profile || profile.email_verified !== true || typeof profile.sub !== "string" || typeof profile.email !== "string") return null;
                const result = await accountRequest("google", {subject: profile.sub, email: profile.email, emailVerified: true});
                token.provider = "google";
                delete token.backendToken;
                delete token.identity;
                if (result.linkRequired === true) {
                    token.pendingGoogle = {subject: profile.sub, email: profile.email, expires: Date.now() + 10 * 60_000};
                } else {
                    token.backendToken = parseLogin(result).token;
                    delete token.pendingGoogle;
                }
            }
            if (token.pendingGoogle && token.pendingGoogle.expires < Date.now()) return null;
            if (trigger === "update") {
                delete token.accountError;
                try {
                    if (token.pendingGoogle && session?.action === "link") {
                        const login = parseLogin(await accountRequest("link", {...token.pendingGoogle, password: session.password}));
                        token.backendToken = login.token;
                        delete token.pendingGoogle;
                    } else if (token.backendToken && session?.action === "complete") {
                        await accountRequest("complete", {username: session.username, acceptTerms: session.acceptTerms, termsVersion: session.termsVersion}, token.backendToken);
                    }
                } catch (error) {
                    token.accountError = error instanceof AccountError ? error.code : "unavailable";
                }
            }
            if (token.backendToken) {
                try {
                    const identity = await accountRequest("current", {}, token.backendToken);
                    if (!isIdentity(identity)) return null;
                    token.identity = identity;
                } catch (error) {
                    if (error instanceof AccountError && error.status === 401) return null;
                    throw error;
                }
            }
            return token;
        },
        session({session, token}) {
            if (token.identity) Object.assign(session.user, {...token.identity, provider: token.provider ?? "credentials", image: null});
            else Object.assign(session.user, {id: "", name: null, email: "", image: null, provider: "google", complete: false, termsVersion: null});
            session.linkRequired = Boolean(token.pendingGoogle);
            session.accountError = token.accountError;
            return session;
        },
    },
    events: {
        async signOut(message) {
            if ("token" in message && message.token?.backendToken) await accountRequest("logout", {}, message.token.backendToken);
        },
    },
});
