import type {} from "./types";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const googleClientId = process.env.AUTH_GOOGLE_ID;
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET;
const authSecret = process.env.AUTH_SECRET ?? (process.env.NODE_ENV === "production" ? undefined : "oskar-lab-development-auth-secret");

const providers = googleClientId && googleClientSecret
    ? [Google({clientId: googleClientId, clientSecret: googleClientSecret})]
    : [];

export const authProviders = {
    google: Boolean(googleClientId && googleClientSecret),
} as const;

export const {handlers, auth, signIn, signOut} = NextAuth({
    providers,
    secret: authSecret,
    session: {
        strategy: "jwt",
    },
    callbacks: {
        jwt({token, account}) {
            if (account?.provider) token.provider = account.provider;
            return token;
        },
        session({session, token}) {
            if (session.user) {
                session.user.id = token.sub ?? "";
                session.user.provider = typeof token.provider === "string" ? token.provider : "google";
            }

            return session;
        },
    },
});
