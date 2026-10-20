import "server-only";
import {createBackendClient} from "@oskar-lab/api/client";
import type {operations} from "@oskar-lab/api/backend";
type AuthAction = operations["invoke"]["parameters"]["path"]["action"];
import {isIdentity, type PlatformIdentity} from "./contracts";
/** Safe backend error code suitable for translated UI messages. */
export class AccountError extends Error {
    constructor(public code: string, public status = 503) { super(code); }
}
/** Calls the private account service using a server-only bridge credential. */
export async function accountRequest(action: AuthAction, input: Record<string, unknown> = {}, token?: string): Promise<Record<string, unknown>> {
    const secret = process.env.AUTH_BRIDGE_SECRET;
    if (!secret || secret.length < 32) throw new AccountError("unavailable");
    let response: Response;
    let body: unknown;
    try {
        const result = await createBackendClient({baseUrl: process.env.AUTH_BACKEND_URL ?? "http://127.0.0.1:10081"}).POST("/internal/auth/{action}", {
            params: {path: {action}}, signal: AbortSignal.timeout(10_000),
            headers: {"X-Auth-Bridge": secret, ...(token ? {Authorization: `Bearer ${token}`} : {})},
            body: input,
        });
        response = result.response;
        body = response.ok ? result.data : result.error;
    } catch { throw new AccountError("unavailable"); }
    if (!response.ok) throw new AccountError(body && typeof body === "object" && "code" in body && typeof body.code === "string" ? body.code : "unavailable", response.status);
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new AccountError("unavailable");
    return body as Record<string, unknown>;
}
/** Validates a session before it enters the encrypted Auth.js cookie. */
export function parseLogin(value: Record<string, unknown>): {user: PlatformIdentity; token: string} {
    if (!isIdentity(value.user) || typeof value.token !== "string") throw new AccountError("unavailable");
    return {user: value.user, token: value.token};
}
