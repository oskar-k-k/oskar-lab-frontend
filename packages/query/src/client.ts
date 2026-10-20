import {isCancelledError, QueryClient} from "@tanstack/react-query";

/** Retries temporary read failures twice; rejected inputs, permissions and cancellations fail immediately. */
export function retryRead(failureCount: number, error: unknown): boolean {
    if (failureCount >= 2 || isCancelledError(error) || error instanceof Error && error.name === "AbortError") return false;
    const status = error && typeof error === "object" && "status" in error ? error.status : undefined;
    return typeof status !== "number" || status >= 500;
}

/** Creates an isolated, memory-only cache. Call per server request or mounted browser account scope. */
export function createQueryClient(): QueryClient {
    return new QueryClient({defaultOptions: {
        queries: {staleTime: 30_000, gcTime: 5 * 60_000, retry: retryRead,
            retryDelay: attempt => attempt === 0 ? 500 : 1500,
            refetchOnWindowFocus: false, refetchOnReconnect: false},
        mutations: {retry: false, networkMode: "always", gcTime: 0},
    }});
}
