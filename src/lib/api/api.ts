const API_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

type ApiOptions = RequestInit;

async function request<T>(
    path: string,
    options?: ApiOptions
): Promise<T> {

    console.log("API URL:", `${API_URL}${path}`);
    console.log("OPTIONS:", options);

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options?.headers,
        },
    });

    if (!response.ok) {
        throw new Error(
            `API Error: ${response.status} ${response.statusText}`
        );
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
            body: body ? JSON.stringify(body) : undefined,
        });
    },

    put<T>(path: string, body?: unknown) {
        return request<T>(path, {
            method: "PUT",
            body: body ? JSON.stringify(body) : undefined,
        });
    },

    delete<T>(path: string) {
        return request<T>(path, {
            method: "DELETE",
        });
    },
};