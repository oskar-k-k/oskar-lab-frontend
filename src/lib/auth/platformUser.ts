import {auth} from "@/auth";

/** User identity shared across Oskar Lab projects without exposing provider-specific data. */
export type PlatformUser = Readonly<{
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    provider: string;
}>;

/** Returns the signed-in platform user, or null when login is optional and absent. */
export async function getCurrentUser(): Promise<PlatformUser | null> {
    const session = await auth();
    const user = session?.user;
    if (!user) return null;

    return {
        id: user.id,
        name: user.name ?? null,
        email: user.email ?? null,
        image: user.image ?? null,
        provider: user.provider,
    };
}

/** Requires login for server-side features that need a persistent platform identity. */
export async function requireCurrentUser(): Promise<PlatformUser> {
    const user = await getCurrentUser();
    if (!user) throw new Error("Authentication required");
    return user;
}
