import {queryOptions} from "@tanstack/react-query";
import {createBrowserClient} from "@oskar-lab/api/client";
import {isAppPage, type App} from "./apps";
import {ApiError} from "./api";

/** Reuses the server-rendered public catalog and recovers through a same-origin route. */
export function catalogQuery() {
    return queryOptions({queryKey: ["catalog", "apps"], staleTime: 60_000, queryFn: async ({signal}): Promise<App[]> => {
        const {data, response} = await createBrowserClient(window.location.origin).GET("/api/apps", {
            signal: AbortSignal.any([signal, AbortSignal.timeout(5000)]),
        });
        if (!response.ok) throw new ApiError(response.status, response.statusText);
        if (!isAppPage(data)) throw new TypeError("The apps API returned an invalid page.");
        return data.content;
    }});
}
