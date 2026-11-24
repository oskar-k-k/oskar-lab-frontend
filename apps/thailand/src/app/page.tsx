import {notFound} from "next/navigation";
import {readTrip, TripDataUnavailableError} from "../lib/data";
import Timeline from "./Timeline";
import DataUnavailable from "./DataUnavailable";
export const dynamic = "force-dynamic";
export default async function Page() {
    let trip;
    try {
        trip = await readTrip();
    } catch (error) {
        if (error instanceof TripDataUnavailableError) return <DataUnavailable />;
        throw error;
    }
    if (!trip) notFound();
    return <Timeline trip={trip} />;
}
