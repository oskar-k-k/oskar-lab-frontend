import {appsApi} from "../../../lib/api/apps";

/** Keeps catalog recovery same-origin while the backend URL stays on the server. */
export async function GET() {
    try {
        return Response.json(await appsApi.getAll(), {headers: {"Cache-Control": "no-store"}});
    } catch {
        return Response.json({code: "unavailable"}, {status: 503, headers: {"Cache-Control": "no-store"}});
    }
}
