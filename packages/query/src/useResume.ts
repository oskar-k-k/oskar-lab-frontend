"use client";

import {useEffect, useEffectEvent} from "react";
import {subscribeToResume} from "./resume";

/** Retries a failed route boundary on resume; normal server-state reads use QueryProvider instead. */
export function useResume(callback: () => void) {
    const resume = useEffectEvent(callback);
    useEffect(() => subscribeToResume(() => resume()), []);
}
