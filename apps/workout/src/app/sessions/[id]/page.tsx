import {notFound} from "next/navigation";
import WorkoutApp from "../../../components/WorkoutApp";

/** Opens a persistent session URL, including after a reload or direct visit. */
export default async function SessionPage({params}: {params: Promise<{id: string}>}) {
    const {id} = await params;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) notFound();
    return <WorkoutApp planId={id} />;
}
