export interface paths {
    "/api/auth/register": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Requires a same-origin request and JSON content type. */
        post: operations["registerAccount"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/session": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["platformSession"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/try-on": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["tryOnStatus"];
        put?: never;
        post: operations["tryOn"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/workout/exercises": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["exercises"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/workout/history/{exerciseId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["history"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/workout/logs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["record"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/workout/plans": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["list_2"];
        put?: never;
        post: operations["create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/workout/plans/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["get"];
        put: operations["update"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/workout/templates": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["templates"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        AppEntity: {
            /** Format: date-time */
            createdAt: string;
            description: string | null;
            /** Format: int64 */
            id: number;
            path: string;
            title: string | null;
            /** Format: date-time */
            updatedAt: string;
        };
        Entry: {
            /** Format: uuid */
            exerciseId: string;
            /** @enum {string} */
            mode: "reps" | "seconds" | "unspecified";
            notes: string;
            /** Format: int32 */
            restMax: number | null;
            /** Format: int32 */
            restMin: number | null;
            /** Format: int32 */
            setsMax: number;
            /** Format: int32 */
            setsMin: number;
            superset: string;
            /** Format: int32 */
            targetMax: number | null;
            /** Format: int32 */
            targetMin: number | null;
            /** @enum {string} */
            trackingMode?: "reps" | "seconds" | "weighted";
        };
        ExerciseDto: {
            /** Format: uuid */
            id: string;
            name: string;
            nameDe: string;
        };
        History: {
            entries: components["schemas"]["Log"][];
            hasMore: boolean;
        };
        LinkRequired: {
            linkRequired: boolean;
        };
        ListRequest: {
            /** Format: int32 */
            page: number;
            /** Format: int32 */
            pageSize: number;
        };
        Log: {
            /** Format: uuid */
            exerciseId: string;
            /** Format: uuid */
            id: string;
            /** Format: date-time */
            recordedAt: string;
            sets: components["schemas"]["SetResult"][];
            /** @enum {string} */
            trackingMode: "reps" | "seconds" | "weighted";
        };
        Login: {
            token: string;
            user: components["schemas"]["PlatformIdentity"];
        };
        Logout: {
            ok: boolean;
        };
        PageableObject: {
            /** Format: int64 */
            offset?: number;
            paged?: boolean;
            /** Format: int32 */
            pageNumber?: number;
            /** Format: int32 */
            pageSize?: number;
            sort?: components["schemas"]["SortObject"];
            unpaged?: boolean;
        };
        PageAppEntity: {
            content: components["schemas"]["AppEntity"][];
            empty: boolean;
            first: boolean;
            last: boolean;
            /** Format: int32 */
            number: number;
            /** Format: int32 */
            numberOfElements: number;
            pageable: components["schemas"]["PageableObject"];
            /** Format: int32 */
            size: number;
            sort: components["schemas"]["SortObject"];
            /** Format: int64 */
            totalElements: number;
            /** Format: int32 */
            totalPages: number;
        };
        Plan: {
            exercises: components["schemas"]["Entry"][];
            /** Format: uuid */
            id: string;
            name: string;
            notes: string;
            template: boolean;
            /** Format: int64 */
            version: number;
        };
        PlanPage: {
            hasMore: boolean;
            plans: components["schemas"]["Plan"][];
        };
        PlatformIdentity: {
            complete: boolean;
            email: string;
            id: string;
            name: string | null;
            termsVersion: string | null;
        };
        SaveLog: {
            /** Format: uuid */
            exerciseId: string;
            /** Format: uuid */
            id: string;
            sets: components["schemas"]["SetResult"][];
            /** @enum {string} */
            trackingMode: "reps" | "seconds" | "weighted";
        };
        SavePlan: {
            exercises: components["schemas"]["Entry"][];
            /** Format: uuid */
            id: string;
            name: string;
            notes: string;
            /** Format: int64 */
            version: number;
        };
        SetResult: {
            /** Format: int32 */
            setNumber: number;
            /** Format: int32 */
            value: number;
            weight: number | null;
        };
        SortObject: {
            empty?: boolean;
            sorted?: boolean;
            unsorted?: boolean;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    registerAccount: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            /** @description Successful response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        ok: boolean;
                    };
                };
            };
            /** @description Successful response */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
        };
    };
    platformSession: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        expires?: string;
                        sessionUnavailable?: boolean;
                        user?: components["schemas"]["PlatformIdentity"];
                    } | null;
                };
            };
        };
    };
    tryOnStatus: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        configured: boolean;
                        engine?: string;
                        online: boolean;
                    };
                };
            };
        };
    };
    tryOn: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": {
                    category?: string;
                    /** Format: binary */
                    garment: Blob;
                    /** Format: binary */
                    person: Blob;
                };
            };
        };
        responses: {
            /** @description Generated image or compatible worker JSON */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        imageBase64?: string;
                        imageUrl?: string;
                    };
                    "image/png": Blob;
                };
            };
            /** @description Successful response */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: string;
                    };
                };
            };
        };
    };
    exercises: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ExerciseDto"][];
                };
            };
            /** @description Request rejected; code is safe for localized feedback */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
            /** @description Request rejected; code is safe for localized feedback */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
            /** @description Request rejected; code is safe for localized feedback */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
            /** @description Request rejected; code is safe for localized feedback */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
            /** @description Request rejected; code is safe for localized feedback */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
            /** @description Request rejected; code is safe for localized feedback */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
        };
    };
    history: {
        parameters: {
            query?: {
                page?: number;
            };
            header?: never;
            path: {
                exerciseId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["History"];
                };
            };
            /** @description Request rejected; code is safe for localized feedback */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
            /** @description Request rejected; code is safe for localized feedback */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
            /** @description Request rejected; code is safe for localized feedback */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
            /** @description Request rejected; code is safe for localized feedback */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
            /** @description Request rejected; code is safe for localized feedback */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
            /** @description Request rejected; code is safe for localized feedback */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
        };
    };
    record: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SaveLog"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["Log"];
                };
            };
            /** @description Request rejected; code is safe for localized feedback */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
            /** @description Request rejected; code is safe for localized feedback */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
            /** @description Request rejected; code is safe for localized feedback */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
            /** @description Request rejected; code is safe for localized feedback */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
            /** @description Request rejected; code is safe for localized feedback */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
            /** @description Request rejected; code is safe for localized feedback */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
        };
    };
    list_2: {
        parameters: {
            query?: {
                page?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PlanPage"];
                };
            };
            /** @description Request rejected; code is safe for localized feedback */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
            /** @description Request rejected; code is safe for localized feedback */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
            /** @description Request rejected; code is safe for localized feedback */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
            /** @description Request rejected; code is safe for localized feedback */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
            /** @description Request rejected; code is safe for localized feedback */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
            /** @description Request rejected; code is safe for localized feedback */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
        };
    };
    create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SavePlan"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["Plan"];
                };
            };
            /** @description Request rejected; code is safe for localized feedback */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
            /** @description Request rejected; code is safe for localized feedback */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
            /** @description Request rejected; code is safe for localized feedback */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
            /** @description Request rejected; code is safe for localized feedback */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
            /** @description Request rejected; code is safe for localized feedback */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
            /** @description Request rejected; code is safe for localized feedback */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
        };
    };
    get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["Plan"];
                };
            };
            /** @description Request rejected; code is safe for localized feedback */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
            /** @description Request rejected; code is safe for localized feedback */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
            /** @description Request rejected; code is safe for localized feedback */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
            /** @description Request rejected; code is safe for localized feedback */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
            /** @description Request rejected; code is safe for localized feedback */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
            /** @description Request rejected; code is safe for localized feedback */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
        };
    };
    update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SavePlan"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["Plan"];
                };
            };
            /** @description Request rejected; code is safe for localized feedback */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
            /** @description Request rejected; code is safe for localized feedback */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
            /** @description Request rejected; code is safe for localized feedback */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
            /** @description Request rejected; code is safe for localized feedback */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
            /** @description Request rejected; code is safe for localized feedback */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
            /** @description Request rejected; code is safe for localized feedback */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
        };
    };
    templates: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["Plan"][];
                };
            };
            /** @description Request rejected; code is safe for localized feedback */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
            /** @description Request rejected; code is safe for localized feedback */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
            /** @description Request rejected; code is safe for localized feedback */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
            /** @description Request rejected; code is safe for localized feedback */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
            /** @description Request rejected; code is safe for localized feedback */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
            /** @description Request rejected; code is safe for localized feedback */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
        };
    };
}
