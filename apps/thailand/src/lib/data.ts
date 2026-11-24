import "server-only";
import {authorizedUser} from "./access";
import {isTrip, type Trip} from "./model";

/** Signals unavailable or invalid private data without disclosing storage diagnostics. */
export class TripDataUnavailableError extends Error {
    constructor() { super("Private travel data is unavailable"); this.name = "TripDataUnavailableError"; }
}

function backendHeaders() {
    const secret = process.env.AUTH_BRIDGE_SECRET;
    if (!secret || secret.length < 32) throw new TripDataUnavailableError();
    return {"X-Auth-Bridge": secret};
}

async function privateFile(filename: string, userId: string) {
    try {
        const response = await fetch(`${process.env.AUTH_BACKEND_URL ?? "http://localhost:10081"}/internal/storage/legacy/thailand/${encodeURIComponent(filename)}`, {
            headers: {...backendHeaders(), "X-User-Id": userId}, cache: "no-store", signal: AbortSignal.timeout(15000),
        });
        if (!response.ok) throw new TripDataUnavailableError();
        return response;
    } catch { throw new TripDataUnavailableError(); }
}

async function loadTrip(userId: string): Promise<Trip> {
    try {
        const value: unknown = await (await privateFile("trip.json", userId)).json();
        if (!isTrip(value)) throw new TripDataUnavailableError();
        return value;
    } catch { throw new TripDataUnavailableError(); }
}

/** Authorizes before loading the migrated private index; no local-file fallback exists. */
export async function readTrip(): Promise<Trip | null> {
    const user = await authorizedUser();
    return user ? loadTrip(user.id) : null;
}

/** Resolves an approved document through its private index before accessing OrbitStorage. */
export async function readDocument(id: string) {
    const user = await authorizedUser();
    if (!user) return null;
    const trip = await loadTrip(user.id);
    const document = trip.documents.find(document => document.id === id);
    if (!document || /[/\\]|\.\./.test(document.filename)) return null;
    const response = await privateFile(document.filename, user.id);
    return {document, bytes: new Uint8Array(await response.arrayBuffer())};
}

/** Checks migrated-index readiness without requesting private booking content. */
export async function tripDataReady(): Promise<boolean> {
    try {
        const response = await fetch(`${process.env.AUTH_BACKEND_URL ?? "http://localhost:10081"}/internal/storage/legacy/thailand-ready`, {
            headers: backendHeaders(), cache: "no-store", signal: AbortSignal.timeout(5000),
        });
        return response.ok && (await response.json()).ready === true;
    } catch { return false; }
}
