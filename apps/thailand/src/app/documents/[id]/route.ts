import {readDocument, TripDataUnavailableError} from "../../../lib/data";
import {privateHeaders} from "../../../lib/access";
export const dynamic = "force-dynamic";
export async function GET(_request: Request, {params}: {params: Promise<{id:string}>}) {
    let result;
    try {
        result = await readDocument((await params).id);
    } catch (error) {
        if (error instanceof TripDataUnavailableError) return new Response(null, {status:503, headers:privateHeaders});
        throw error;
    }
    if (!result) return new Response(null, {status:404, headers:privateHeaders});
    return new Response(new Uint8Array(result.bytes), {headers:{...privateHeaders, "Content-Type":result.document.mime,
        "Content-Disposition":`inline; filename="${result.document.filename}"`, "Content-Security-Policy":"sandbox"}});
}
