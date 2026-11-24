import {notFound} from "next/navigation";
import {readTrip} from "../lib/data";
import Timeline from "./Timeline";
export const dynamic = "force-dynamic";
export default async function Page() {
    const trip = await readTrip();
    if (!trip) notFound();
    return <Timeline trip={trip} />;
}
