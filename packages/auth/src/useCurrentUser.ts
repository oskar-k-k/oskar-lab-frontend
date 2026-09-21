"use client";
import type {} from "./types";
import {useSession} from "next-auth/react";

/** Exposes completed platform identities; UI checks never replace server authorization. */
export function useCurrentUser() {
    const {data, status} = useSession();
    return {user: data?.user.complete ? data.user : null, loading: status === "loading", needsOnboarding: Boolean(data && !data.user.complete)};
}
