export type TripEvent = {
    id: string; date: string; time?: string; kind: "flight" | "stay" | "experience" | "transfer";
    title: string; location: string; subtitle: string; details: {label: string; value: string}[];
    note?: string; documents?: string[]; source: string;
};
export type TripDocument = {id: string; title: string; filename: string; mime: "application/pdf" | "image/png" | "text/plain"};
export type Trip = {start: string; end: string; updated: string; events: TripEvent[]; documents: TripDocument[]; missing: string[]};

function isRecord(value: unknown): value is Record<string, unknown> { return Boolean(value && typeof value === "object"); }
function isDate(value: unknown): value is string {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(value + "T12:00:00Z");
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
function isStringArray(value: unknown): value is string[] { return Array.isArray(value) && value.every(item => typeof item === "string"); }
function isEvent(value: unknown): boolean {
    if (!isRecord(value)) return false;
    return ["id", "title", "location", "subtitle", "source"].every(key => typeof value[key] === "string") && isDate(value.date) &&
        ["flight", "stay", "experience", "transfer"].includes(String(value.kind)) &&
        (value.time === undefined || (typeof value.time === "string" && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value.time))) &&
        (value.note === undefined || typeof value.note === "string") && (value.documents === undefined || isStringArray(value.documents)) &&
        Array.isArray(value.details) && value.details.every(detail => isRecord(detail) && typeof detail.label === "string" && typeof detail.value === "string");
}

/** Validates private migrated JSON before it can reach rendering or date iteration. */
export function isTrip(value: unknown): value is Trip {
    if (!isRecord(value) || !isDate(value.start) || !isDate(value.end) || !isDate(value.updated)) return false;
    const days = (Date.parse(value.end) - Date.parse(value.start)) / 86400000;
    return days >= 0 && days <= 366 && isStringArray(value.missing) && Array.isArray(value.events) && value.events.length <= 1000 && value.events.every(isEvent) &&
        Array.isArray(value.documents) && value.documents.length <= 100 && value.documents.every(document => isRecord(document) &&
            typeof document.id === "string" && typeof document.title === "string" && typeof document.filename === "string" &&
            !/[/\\]|\.\./.test(document.filename) && ["application/pdf", "image/png", "text/plain"].includes(String(document.mime)));
}
export function daysOfTrip(trip: Trip) {
    const days: {date: string; events: TripEvent[]}[] = [];
    for (let day = new Date(trip.start + "T12:00:00Z"); day.toISOString().slice(0,10) <= trip.end; day = new Date(day.getTime() + 86400000)) {
        const date = day.toISOString().slice(0,10);
        days.push({date, events: trip.events.filter(event => event.date === date).sort((a,b) => (a.time ?? "23:59").localeCompare(b.time ?? "23:59"))});
    }
    return days;
}
