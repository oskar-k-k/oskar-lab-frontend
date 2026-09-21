/** Version recorded with each explicit acceptance of the platform terms. */
export const TERMS_VERSION = "2026-09-21";
/** Public identity, without provider credentials or backend session tokens. */
export type PlatformIdentity = {id: string; name: string | null; email: string; complete: boolean; termsVersion: string | null};
/** Validates identities at the backend boundary. */
export function isIdentity(value: unknown): value is PlatformIdentity {
    if (!value || typeof value !== "object") return false;
    const user = value as Record<string, unknown>;
    return typeof user.id === "string" && typeof user.email === "string" &&
        (user.name === null || typeof user.name === "string") && typeof user.complete === "boolean" &&
        (user.termsVersion === null || typeof user.termsVersion === "string");
}
/** Keeps post-login navigation on local app pages. */
export function safeReturnPath(value: unknown): string {
    if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || /[\\\\\r\n]/.test(value)) return "/";
    try {
        const url = new URL(value, "https://platform.invalid");
        if (url.origin !== "https://platform.invalid" || /^\/(?:api|account)(?:\/|$)/.test(url.pathname)) return "/";
        return url.pathname + url.search + url.hash;
    } catch { return "/"; }
}
