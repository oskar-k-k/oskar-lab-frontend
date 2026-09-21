import {notFound} from "next/navigation";
import WorkoutApp from "../../../../../components/WorkoutApp";

/** Resolves a prescribed exercise by its position, including repeated catalog exercises. */
export default async function ExercisePage({params}: {params: Promise<{id: string; position: string}>}) {
    const {id, position} = await params;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) || !/^(0|[1-9][0-9]?)$/.test(position)) notFound();
    return <WorkoutApp planId={id} exercisePosition={Number(position)} />;
}
