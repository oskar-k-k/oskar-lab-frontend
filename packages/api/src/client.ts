import createClient, {type ClientOptions} from "openapi-fetch";
import type {paths as BackendPaths} from "./generated/backend";
import type {paths as BrowserPaths} from "./generated/browser";
import type {paths as WorkerPaths} from "./generated/worker";

/** Creates a typed backend client. Server credentials must only be supplied by server code. */
export function createBackendClient(options: ClientOptions) {
    return createClient<BackendPaths>({cache: "no-store", ...options});
}

/** Creates a same-origin app client; baseUrl includes the app's configured base path. */
export function createBrowserClient(baseUrl: string) {
    return createClient<BrowserPaths>({baseUrl, cache: "no-store"});
}

/** Creates a server-side client for the self-hosted image worker. */
export function createWorkerClient(options: ClientOptions) {
    return createClient<WorkerPaths>({cache: "no-store", ...options});
}

/** Serializes OpenAPI multipart objects without setting the browser-generated boundary header. */
export function multipartBody(body: Record<string, string | Blob | undefined>): FormData {
    const form = new FormData();
    for (const [name, value] of Object.entries(body)) {
        if (value !== undefined) form.set(name, value);
    }
    return form;
}
