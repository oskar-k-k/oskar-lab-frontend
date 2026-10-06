import {NextRequest} from "next/server";
async function proxy(request: NextRequest, context: {params: Promise<{path: string[]}>}) {
    const {path} = await context.params;
    if (!(path.length === 1 && path[0] === "rooms" || path.length >= 2 && path.length <= 3 && path[0] === "rooms" && /^\d{6}$/.test(path[1]) && (path.length === 2 || ["join", "actions"].includes(path[2])))) return Response.json({message: "Nicht gefunden."}, {status: 404});
    const publicHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? request.nextUrl.host;
    const publicProtocol = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");
    if (request.method === "POST" && request.headers.get("origin") !== `${publicProtocol}://${publicHost}`) return Response.json({message: "Ungültiger Ursprung."}, {status: 403});
    const headers: Record<string, string> = {"Content-Type": "application/json"};
    const token = request.headers.get("x-tierlist-token"); if (token) headers["X-Tierlist-Token"] = token;
    try {
        const body = request.method === "POST" ? await request.text() : undefined;
        if (body && body.length > 40000) return Response.json({message: "Anfrage zu groß."}, {status: 413});
        const response = await fetch(`${process.env.TIERLIST_BACKEND_URL ?? "http://127.0.0.1:10081"}/tierlist/${path.join("/")}`, {method: request.method, headers, body, cache: "no-store", signal: AbortSignal.timeout(8000)});
        return new Response(await response.text(), {status: response.status, headers: {"Content-Type": "application/json", "Cache-Control": "no-store"}});
    } catch { return Response.json({message: "Das Spiel-Backend ist gerade nicht erreichbar."}, {status: 503}); }
}
export const GET = proxy;
export const POST = proxy;
