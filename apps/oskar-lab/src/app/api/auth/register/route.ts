import {AccountError, accountRequest} from "@oskar-lab/auth/backend";

/** Registers a local account; exact origin checks prevent cross-site form submission. */
export async function POST(request: Request) {
    let origin: URL;
    try { origin = new URL(request.headers.get("origin") ?? ""); }
    catch { return Response.json({code: "forbidden"}, {status: 403}); }
    if (!["http:", "https:"].includes(origin.protocol) || origin.host !== request.headers.get("host")) return Response.json({code: "forbidden"}, {status: 403});
    if (!request.headers.get("content-type")?.startsWith("application/json")) return Response.json({code: "invalidRequest"}, {status: 415});
    try {
        const text = await request.text();
        if (text.length > 8192) return Response.json({code: "invalidRequest"}, {status: 413});
        const input: unknown = JSON.parse(text);
        if (!input || typeof input !== "object" || Array.isArray(input)) return Response.json({code: "invalidRequest"}, {status: 400});
        await accountRequest("register", input as Record<string, unknown>);
        return Response.json({ok: true}, {status: 201});
    } catch (error) {
        if (error instanceof SyntaxError) return Response.json({code: "invalidRequest"}, {status: 400});
        return Response.json({code: error instanceof AccountError ? error.code : "unavailable"}, {status: error instanceof AccountError ? error.status : 503});
    }
}
