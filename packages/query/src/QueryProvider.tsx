"use client";

import {useEffect, useRef, useState, type ReactNode} from "react";
import {QueryClientProvider} from "@tanstack/react-query";
import {createQueryClient} from "./client";
import {subscribeToResume} from "./resume";

/** Provides one isolated cache; change its React key when the authenticated account changes. */
export default function QueryProvider({children}: Readonly<{children: ReactNode}>) {
    const [client] = useState(createQueryClient);
    const lifetime = useRef({generation: 0});
    useEffect(() => subscribeToResume(() => {
        void client.refetchQueries({type: "active", stale: true}, {cancelRefetch: false});
    }), [client]);
    useEffect(() => {
        const scope = lifetime.current;
        const generation = ++scope.generation;
        return () => queueMicrotask(() => {
            // Strict Mode replays effects with the same client; only discard a scope that stays unmounted.
            if (scope.generation === generation) client.clear();
        });
    }, [client]);
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
