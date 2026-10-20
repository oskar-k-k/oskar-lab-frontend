import {infiniteQueryOptions, queryOptions} from "@tanstack/react-query";
import {isExercise, isPlan, isPlanPage, type Exercise, type Plan} from "../model/workout";
import {isHistory} from "../model/tracking";
import {request} from "./client";

const isCatalog = (value: unknown): value is Exercise[] => Array.isArray(value) && value.every(isExercise);
const isPlans = (value: unknown): value is Plan[] => Array.isArray(value) && value.every(isPlan);

/** Separates public resources from each account's personal cache. */
export const workoutKeys = {
    personal: (ownerId: string | null) => ["workout", "private", ownerId] as const,
    plan: (ownerId: string | null, id: string) => [...workoutKeys.personal(ownerId), "plan", id] as const,
    history: (ownerId: string, exerciseId: string) => [...workoutKeys.personal(ownerId), "history", exerciseId] as const,
};

/** Shares one validated exercise catalog across session and independent tracking views. */
export function catalogQuery() {
    return queryOptions({queryKey: ["workout", "public", "exercises"], staleTime: 5 * 60_000,
        queryFn: ({signal}) => request("exercises", isCatalog, undefined, "GET", signal)});
}

/** Caches the public starter sessions independently of personal plans. */
export function templatesQuery() {
    return queryOptions({queryKey: ["workout", "public", "templates"], staleTime: 5 * 60_000,
        queryFn: ({signal}) => request("templates", isPlans, undefined, "GET", signal)});
}

/** Loads a template locally or requests one account-scoped plan. */
export function planQuery(ownerId: string | null, id: string, templates: Plan[]) {
    return queryOptions({queryKey: workoutKeys.plan(ownerId, id), queryFn: ({signal}) =>
        templates.find(plan => plan.id === id) ?? request(`plans/${id}`, isPlan, undefined, "GET", signal)});
}

/** Keeps personal pagination within its account and refreshes loaded pages together. */
export function personalPlansQuery(ownerId: string | null) {
    return infiniteQueryOptions({queryKey: [...workoutKeys.personal(ownerId), "plans"], initialPageParam: 0,
        queryFn: ({pageParam, signal}) => {
            if (!ownerId) throw new Error("Authentication required");
            return request(`plans?page=${pageParam}`, isPlanPage, undefined, "GET", signal);
        },
        getNextPageParam: (last, _pages, page) => last.hasMore ? page + 1 : undefined,
    });
}

/** Loads personal exercise history without sharing it across accounts or exercises. */
export function historyQuery(ownerId: string, exerciseId: string) {
    return infiniteQueryOptions({queryKey: workoutKeys.history(ownerId, exerciseId), initialPageParam: 0,
        queryFn: ({pageParam, signal}) => request(`history/${exerciseId}?page=${pageParam}`, isHistory, undefined, "GET", signal),
        getNextPageParam: (last, _pages, page) => last.hasMore ? page + 1 : undefined,
    });
}
