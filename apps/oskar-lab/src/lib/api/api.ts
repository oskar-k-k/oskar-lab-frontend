const API_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:10081";

type ApiOptions = RequestInit;

/** Error returned when the server responds with a non-successful HTTP status. */
export class ApiError extends Error {
    constructor(
        public readonly status: number,
        public readonly statusText: string,
    ) {
        super(`API request failed: ${status} ${statusText}`);
        this.name = "ApiError";
    }
}

/** Sends a JSON request without caching user- or session-dependent responses. */
async function request<T>(
    path: string,
    options?: ApiOptions
): Promise<T> {

    const response = await fetch(`${API_URL}${path}`, {
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options?.headers,
        },
    });

    if (!response.ok) {
        throw new ApiError(response.status, response.statusText);
    }

    return response.json();
}

export const api = {
    get<T>(path: string) {
        return request<T>(path);
    },

    post<T>(path: string, body?: unknown) {
        return request<T>(path, {
            method: "POST",
            body: body === undefined ? undefined : JSON.stringify(body),
        });
    },

    put<T>(path: string, body?: unknown) {
        return request<T>(path, {
            method: "PUT",
            body: body === undefined ? undefined : JSON.stringify(body),
        });
    },

    delete<T>(path: string) {
        return request<T>(path, {
            method: "DELETE",
        });
    },
};
