import {queryOptions} from "@tanstack/react-query";
import {createBrowserClient, multipartBody} from "@oskar-lab/api/client";
import {appPath} from "@oskar-lab/config/paths";

function client() {
    return createBrowserClient(`${window.location.origin}${appPath("")}`);
}

/** Polls readiness only while the page is visible; retries and cancellation use the shared query policy. */
export function workerStatusQuery() {
    return queryOptions({queryKey: ["cloth-lab", "worker-status"], staleTime: 5000, refetchInterval: 10_000,
        queryFn: async ({signal}) => {
            const result = await client().GET("/api/try-on", {signal: AbortSignal.any([signal, AbortSignal.timeout(5000)])});
            if (!result.response.ok) throw new Error("Worker status unavailable");
            const data: unknown = result.data;
            if (!data || typeof data !== "object" || !("online" in data) || typeof data.online !== "boolean")
                throw new TypeError("Invalid worker status");
            return data.online;
        },
    });
}

/** Sends one upload and returns image data without persisting it in a query cache. */
export async function generateImage(person: File, garment: File, signal: AbortSignal,
    messages: {generic: string; invalid: string}): Promise<Blob | string> {
    const result = await client().POST("/api/try-on", {
        body: {person, garment, category: "upper_body"}, bodySerializer: multipartBody, parseAs: "stream",
        signal: AbortSignal.any([signal, AbortSignal.timeout(16 * 60 * 1000)]),
    });
    const response = result.response;
    if (!response.ok) {
        const error: unknown = result.error;
        throw new Error(error && typeof error === "object" && "error" in error && typeof error.error === "string" ? error.error : messages.generic);
    }
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.startsWith("image/")) return response.blob();
    if (contentType.includes("application/json")) {
        const payload: unknown = await response.json();
        if (payload && typeof payload === "object") {
            if ("imageUrl" in payload && typeof payload.imageUrl === "string" && payload.imageUrl) return payload.imageUrl;
            if ("imageBase64" in payload && typeof payload.imageBase64 === "string" && payload.imageBase64)
                return `data:image/png;base64,${payload.imageBase64}`;
        }
    }
    throw new Error(messages.invalid);
}
