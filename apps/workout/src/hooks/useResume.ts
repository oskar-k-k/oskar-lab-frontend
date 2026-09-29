"use client";
import {useEffect, useEffectEvent} from "react";
import {subscribeToResume} from "../services/resume";

/** Refreshes read-only data after standby without remounting the current exercise or drafts. */
export function useResume(callback: () => void) {
    const resume = useEffectEvent(callback);
    useEffect(() => subscribeToResume(() => resume()), []);
}
