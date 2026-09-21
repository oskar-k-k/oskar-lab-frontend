import {getCurrentUser} from "@oskar-lab/auth/platformUser";
import {isPlan} from "../../../../model/workout";

async function proxy(request: Request, context: {params: Promise<{path: string[]}>}) {
    const {path} = await context.params;
    const route = path.join("/");
    const read = request.method === "GET";
    const publicRead = read && (route === "templates" || route === "exercises");
    const validRoute = publicRead || route === "plans" || /^plans\/[0-9a-f-]{36}$/i.test(route);
    if (!validRoute || (!read && route !== "plans" && request.method !== "PUT") || (request.method === "PUT" && route === "plans"))
        return Response.json({code: "notFound"}, {status: 404});
    const allowedOrigins = new Set([new URL(request.url).origin,
        new URL(process.env.AUTH_PLATFORM_URL ?? "http://localhost:10030").origin]);
    if (process.env.WORKOUT_PUBLIC_URL) allowedOrigins.add(new URL(process.env.WORKOUT_PUBLIC_URL).origin);
    if (!read && !allowedOrigins.has(request.headers.get("origin") ?? ""))
        return Response.json({code: "unauthorized"}, {status: 403});
    try {
        const secret = process.env.AUTH_BRIDGE_SECRET;
        if (!secret || secret.length < 32) return Response.json({code: "unavailable"}, {status: 503});
        const user = publicRead ? null : await getCurrentUser();
        if (!publicRead && !user) return Response.json({code: "unauthorized"}, {status: 401});
        let body;
        if (!read) {
            const raw = await request.text();
            if (raw.length > 200000) return Response.json({code: "invalidPlan"}, {status: 413});
            try { body = JSON.parse(raw); } catch { return Response.json({code: "invalidPlan"}, {status: 400}); }
            if (!isPlan(body)) return Response.json({code: "invalidPlan"}, {status: 400});
        }
        const query = new URL(request.url).searchParams;
        const page = query.get("page") ?? "0";
        if (!/^\d{1,5}$/.test(page) || Number(page) > 10000) return Response.json({code: "invalidPlan"}, {status: 400});
        const response = await fetch(`${process.env.AUTH_BACKEND_URL ?? "http://127.0.0.1:10081"}/internal/workout/${route}${route === "plans" && read ? `?page=${page}` : ""}`, {
            method: request.method, cache: "no-store", signal: AbortSignal.timeout(10000),
            headers: {"Content-Type": "application/json", "X-Auth-Bridge": secret, ...(user ? {"X-User-Id": user.id} : {})},
            ...(body ? {body: JSON.stringify(body)} : {}),
        });
        const data: unknown = await response.json();
        return Response.json(response.ok ? data : {code: response.status === 409 ? "conflict" : "failed"},
            {status: response.status, headers: {"Cache-Control": "no-store"}});
    } catch { return Response.json({code: "unavailable"}, {status: 503}); }
}

/** Reads templates/catalog for guests and owner-scoped sessions for signed-in users. */
export const GET = proxy;
/** Creates a personal session through the authenticated platform bridge. */
export const POST = proxy;
/** Saves an existing personal session using optimistic locking. */
export const PUT = proxy;
