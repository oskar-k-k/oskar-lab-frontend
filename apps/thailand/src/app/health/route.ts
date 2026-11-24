import {access, constants} from "node:fs/promises";
import path from "node:path";
import {dataDirectory} from "../../lib/data";

export const dynamic = "force-dynamic";

/** Reports data readiness without returning private content or filesystem details. */
export async function GET() {
    try {
        await access(path.join(dataDirectory(), "trip.json"), constants.R_OK);
        return new Response("ok", {headers: {"Cache-Control": "no-store"}});
    } catch {
        return new Response("unavailable", {status: 503, headers: {"Cache-Control": "no-store"}});
    }
}
