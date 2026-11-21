import {createHash} from "node:crypto";
type PrivateSession = {user?: {id?: string; email?: string | null; provider?: string; complete?: boolean}; linkRequired?: boolean; sessionUnavailable?: boolean} | null | undefined;
/** Only verified server sessions may enter private projects. Hashes avoid publishing account addresses. */
export function canAccessPrivateProject(session: PrivateSession, allowedEmailHashes: readonly string[]): boolean {
    const user = session?.user;
    return Boolean(user?.id && user.complete && user.provider === "google" && !session?.linkRequired && !session?.sessionUnavailable &&
        allowedEmailHashes.includes(createHash("sha256").update(user.email?.toLowerCase() ?? "").digest("hex")));
}
export function canAccessThailand(session: PrivateSession): boolean {
    return canAccessPrivateProject(session, [
        "d431115189e62eef918543f6dbe89fbb71ddb606f367a5cc2e585fc31b6f7be8",
        "f61b797003b620af569e7fe9e74192ab5ff78bbf212df55c9c8d130d1df0e32c",
    ]);
}
