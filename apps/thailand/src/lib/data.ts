import "server-only";
import {readFile} from "node:fs/promises";
import path from "node:path";
import {hasAccess} from "./access";
import type {Trip} from "./model";

/** Signals that authorized travel data cannot currently be loaded. */
export class TripDataUnavailableError extends Error {
    constructor() {
        super("Private travel data is unavailable");
        this.name = "TripDataUnavailableError";
    }
}

export const dataDirectory = () => process.env.THAILAND_DATA_DIR ?? path.join(process.cwd(), "private-data");
/** Authorization happens at the data boundary, including direct document requests. */
export async function readTrip(): Promise<Trip | null> {
    if (!await hasAccess()) return null;
    // Runtime-mounted private files must never be copied into a traced build artifact.
    try {
        return JSON.parse(await readFile(/*turbopackIgnore: true*/ path.join(/*turbopackIgnore: true*/ dataDirectory(), "trip.json"), "utf8")) as Trip;
    } catch (error) {
        if (error instanceof SyntaxError || (error && typeof error === "object" && "code" in error &&
            ["ENOENT", "EACCES", "EPERM"].includes(String(error.code)))) {
            throw new TripDataUnavailableError();
        }
        throw error;
    }
}
export async function readDocument(id: string) {
    const trip = await readTrip();
    const document = trip?.documents.find(document => document.id === id);
    if (!document || path.basename(document.filename) !== document.filename) return null;
    return {document, bytes: await readFile(/*turbopackIgnore: true*/ path.join(/*turbopackIgnore: true*/ dataDirectory(), document.filename))};
}
