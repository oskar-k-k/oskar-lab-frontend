import {headers} from "next/headers";
import {isIdentity} from "./contracts";

/** User identity shared across Oskar Lab projects without exposing provider-specific data. */
export type PlatformUser = Readonly<{
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    provider: string;
}>;

/** Returns a completed platform identity, or null for guests and unfinished onboarding. */
export async function getCurrentUser(): Promise<PlatformUser | null> {
    const requestHeaders = await headers();
    const response = await fetch(`${process.env.AUTH_PLATFORM_URL ?? "http://127.0.0.1:10030"}/api/auth/session`, {
        headers: {cookie: requestHeaders.get("cookie") ?? ""}, cache: "no-store", signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error("Account service unavailable");
    const session: unknown = await response.json();
    if (!session || typeof session !== "object" || !("user" in session)) return null;
    const user = session.user;
    if (!isIdentity(user) || !user.complete) return null;

    return {
        id: user.id,
        name: user.name ?? null,
        email: user.email ?? null,
        image: null,
        provider: "provider" in user && typeof user.provider === "string" ? user.provider : "credentials",
    };
}

/** Requires login for server-side features that need a persistent platform identity. */
export async function requireCurrentUser(): Promise<PlatformUser> {
    const user = await getCurrentUser();
    if (!user) throw new Error("Authentication required");
    return user;
}
