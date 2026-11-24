import {tripDataReady} from "../../lib/data";

export const dynamic = "force-dynamic";

/** Reports data readiness without returning private content or filesystem details. */
export async function GET(request?: Request) {
    if (request && new URL(request.url).searchParams.get("probe") === "liveness")
        return new Response("ok", {headers: {"Cache-Control": "no-store"}});
    const ready = await tripDataReady();
    return new Response(ready ? "ok" : "unavailable", {status: ready ? 200 : 503, headers: {"Cache-Control": "no-store"}});
}
