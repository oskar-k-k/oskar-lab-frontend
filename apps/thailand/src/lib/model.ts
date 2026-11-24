export type TripEvent = {
    id: string; date: string; time?: string; kind: "flight" | "stay" | "experience" | "transfer";
    title: string; location: string; subtitle: string; details: {label: string; value: string}[];
    note?: string; documents?: string[]; source: string;
};
export type TripDocument = {id: string; title: string; filename: string; mime: "application/pdf" | "image/png" | "text/plain"};
export type Trip = {start: string; end: string; updated: string; events: TripEvent[]; documents: TripDocument[]; missing: string[]};
export function daysOfTrip(trip: Trip) {
    const days: {date: string; events: TripEvent[]}[] = [];
    for (let day = new Date(trip.start + "T12:00:00Z"); day.toISOString().slice(0,10) <= trip.end; day = new Date(day.getTime() + 86400000)) {
        const date = day.toISOString().slice(0,10);
        days.push({date, events: trip.events.filter(event => event.date === date).sort((a,b) => (a.time ?? "23:59").localeCompare(b.time ?? "23:59"))});
    }
    return days;
}
