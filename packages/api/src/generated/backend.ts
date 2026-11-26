export interface paths {
    "/apps": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["list_1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/apps/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["get_3"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/internal/auth/{action}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Server-only account actions. complete, current and logout also require a backend session Bearer token. Input fields depend on the action and are validated by AccountService. */
        post: operations["invoke"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/internal/storage/legacy/thailand-ready": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ready"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/internal/storage/legacy/thailand/{path}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["privateThailand"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/internal/storage/migrations/travel": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["migrate"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/internal/travel/trips": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["list_3"];
        put?: never;
        post: operations["create_2"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/internal/travel/trips/{tripId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["get_1"];
        put: operations["update_1"];
        post?: never;
        delete: operations["delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/internal/travel/trips/{tripId}/entries": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["entries"];
        put?: never;
        post: operations["createEntry"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/internal/travel/trips/{tripId}/entries/{entryId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getEntry"];
        put: operations["updateEntry"];
        post?: never;
        delete: operations["deleteEntry"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/internal/travel/trips/{tripId}/entries/{entryId}/attachments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["attachments"];
        put?: never;
        post: operations["upload"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/internal/travel/trips/{tripId}/entries/{entryId}/attachments/{attachmentId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["download"];
        put?: never;
        post?: never;
        delete: operations["deleteAttachment"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/internal/travel/trips/{tripId}/viewers": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["viewers"];
        put?: never;
        post: operations["invite"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/internal/travel/trips/{tripId}/viewers/{viewerId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: operations["revoke"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/internal/workout/exercises": {
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
    "/internal/workout/history/{exerciseId}": {
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
    "/internal/workout/logs": {
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
    "/internal/workout/plans": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["list_2"];
        put?: never;
        post: operations["create_1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/internal/workout/plans/{id}": {
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
    "/internal/workout/templates": {
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
    "/projects": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["list"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["get_2"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/public-assets/{project}/{path}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["publicAsset"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/tierlist/rooms": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/tierlist/rooms/{code}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["view"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/tierlist/rooms/{code}/actions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["action"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/tierlist/rooms/{code}/join": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["join"];
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
        Action: {
            action?: string;
            /** Format: int32 */
            round?: number;
            /** Format: int32 */
            row?: number;
        };
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
        Create: {
            category?: string;
            extraWords?: string[];
            name?: string;
            /** Format: int32 */
            rounds?: number;
            rows?: string[];
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
        Join: {
            name?: string;
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
        TravelAttachment: {
            /** Format: uuid */
            entryId: string;
            filename: string;
            /** Format: uuid */
            id: string;
            mediaType: string;
            /** @enum {string|null} */
            pointRole: "DEPARTURE" | "ARRIVAL" | "CHECK_IN" | "CHECK_OUT" | "START" | "END" | null;
            /** Format: int64 */
            size: number;
        };
        TravelEntry: {
            bookingSource: string;
            /** Format: int64 */
            durationMinutes: number | null;
            /** Format: uuid */
            id: string;
            notes: string;
            points: components["schemas"]["TravelPoint"][];
            reference: string;
            title: string;
            /** Format: uuid */
            tripId: string;
            /** @enum {string} */
            type: "FLIGHT" | "BOAT" | "TRAIN" | "BUS" | "TRANSFER" | "HOTEL" | "APARTMENT" | "ACTIVITY" | "RESTAURANT" | "TOUR";
            /** Format: int64 */
            version: number;
        };
        TravelEntryPage: {
            entries: components["schemas"]["TravelEntry"][];
            hasMore: boolean;
        };
        TravelInviteViewer: {
            email: string;
        };
        TravelPoint: {
            address: string;
            /** Format: date */
            date: string;
            mapEmbedUrl: string | null;
            placeName: string;
            /** @enum {string} */
            role: "DEPARTURE" | "ARRIVAL" | "CHECK_IN" | "CHECK_OUT" | "START" | "END";
            /** Format: time-local */
            time: string | null;
            /** @enum {string} */
            timeMeaning: "EXACT" | "NOT_BEFORE" | "NOT_AFTER" | "UNSPECIFIED";
            timeZone: string;
            utcOffset: string | null;
        };
        TravelSaveEntry: {
            bookingSource?: string;
            notes?: string;
            points: components["schemas"]["TravelPoint"][];
            reference?: string;
            title: string;
            /** @enum {string} */
            type: "FLIGHT" | "BOAT" | "TRAIN" | "BUS" | "TRANSFER" | "HOTEL" | "APARTMENT" | "ACTIVITY" | "RESTAURANT" | "TOUR";
            /** Format: int64 */
            version: number;
        };
        TravelSaveTrip: {
            /** Format: date */
            endDate: string;
            notes?: string;
            /** Format: date */
            startDate: string;
            title: string;
            /** Format: int64 */
            version: number;
        };
        TravelTrip: {
            canEdit: boolean;
            /** Format: date */
            endDate: string;
            /** Format: uuid */
            id: string;
            notes: string;
            /** Format: uuid */
            ownerId: string;
            /** Format: date */
            startDate: string;
            title: string;
            /** Format: int64 */
            version: number;
        };
        TravelTripPage: {
            hasMore: boolean;
            trips: components["schemas"]["TravelTrip"][];
        };
        TravelViewer: {
            email: string;
            /** Format: uuid */
            id: string;
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
    list_1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ListRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PageAppEntity"];
                };
            };
        };
    };
    get_3: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
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
                    "*/*": components["schemas"]["AppEntity"];
                };
            };
        };
    };
    invoke: {
        parameters: {
            query?: never;
            header?: {
                "X-Auth-Bridge"?: string;
                Authorization?: string;
            };
            path: {
                action: "register" | "login" | "google" | "link" | "complete" | "current" | "logout";
            };
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
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PlatformIdentity"] | components["schemas"]["Login"] | components["schemas"]["LinkRequired"] | components["schemas"]["Logout"];
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
            413: {
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
            415: {
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
    ready: {
        parameters: {
            query?: never;
            header: {
                "X-Auth-Bridge": string;
            };
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
                    "*/*": {
                        [key: string]: boolean;
                    };
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
            413: {
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
            415: {
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
    privateThailand: {
        parameters: {
            query?: never;
            header: {
                "X-Auth-Bridge": string;
                "X-User-Id": string;
            };
            path: {
                path: string;
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
                    "*/*": string;
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
            413: {
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
            415: {
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
    migrate: {
        parameters: {
            query?: never;
            header?: {
                "X-Auth-Bridge"?: string;
            };
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
                    "*/*": {
                        [key: string]: number;
                    };
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
            413: {
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
            415: {
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
    list_3: {
        parameters: {
            query?: {
                page?: number;
            };
            header: {
                "X-User-Id": string;
            };
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
                    "*/*": components["schemas"]["TravelTripPage"];
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
            413: {
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
            415: {
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
    create_2: {
        parameters: {
            query?: never;
            header: {
                "X-User-Id": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TravelSaveTrip"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["TravelTrip"];
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
            413: {
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
            415: {
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
    get_1: {
        parameters: {
            query?: never;
            header: {
                "X-User-Id": string;
            };
            path: {
                tripId: string;
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
                    "*/*": components["schemas"]["TravelTrip"];
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
            413: {
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
            415: {
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
    update_1: {
        parameters: {
            query?: never;
            header: {
                "X-User-Id": string;
            };
            path: {
                tripId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TravelSaveTrip"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["TravelTrip"];
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
            413: {
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
            415: {
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
    delete: {
        parameters: {
            query: {
                version: number;
            };
            header: {
                "X-User-Id": string;
            };
            path: {
                tripId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
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
            413: {
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
            415: {
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
    entries: {
        parameters: {
            query?: {
                page?: number;
            };
            header: {
                "X-User-Id": string;
            };
            path: {
                tripId: string;
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
                    "*/*": components["schemas"]["TravelEntryPage"];
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
            413: {
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
            415: {
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
    createEntry: {
        parameters: {
            query?: never;
            header: {
                "X-User-Id": string;
            };
            path: {
                tripId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TravelSaveEntry"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["TravelEntry"];
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
            413: {
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
            415: {
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
    getEntry: {
        parameters: {
            query?: never;
            header: {
                "X-User-Id": string;
            };
            path: {
                tripId: string;
                entryId: string;
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
                    "*/*": components["schemas"]["TravelEntry"];
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
            413: {
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
            415: {
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
    updateEntry: {
        parameters: {
            query?: never;
            header: {
                "X-User-Id": string;
            };
            path: {
                tripId: string;
                entryId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TravelSaveEntry"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["TravelEntry"];
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
            413: {
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
            415: {
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
    deleteEntry: {
        parameters: {
            query: {
                version: number;
            };
            header: {
                "X-User-Id": string;
            };
            path: {
                tripId: string;
                entryId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
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
            413: {
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
            415: {
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
    attachments: {
        parameters: {
            query?: never;
            header: {
                "X-User-Id": string;
            };
            path: {
                tripId: string;
                entryId: string;
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
                    "*/*": components["schemas"]["TravelAttachment"][];
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
            413: {
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
            415: {
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
    upload: {
        parameters: {
            query?: {
                pointRole?: "DEPARTURE" | "ARRIVAL" | "CHECK_IN" | "CHECK_OUT" | "START" | "END";
            };
            header: {
                "X-User-Id": string;
            };
            path: {
                tripId: string;
                entryId: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "multipart/form-data": {
                    /** Format: binary */
                    file: Blob;
                };
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["TravelAttachment"];
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
            413: {
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
            415: {
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
    download: {
        parameters: {
            query?: never;
            header: {
                "X-User-Id": string;
            };
            path: {
                tripId: string;
                entryId: string;
                attachmentId: string;
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
                    "application/octet-stream": Blob;
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
            413: {
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
            415: {
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
    deleteAttachment: {
        parameters: {
            query?: never;
            header: {
                "X-User-Id": string;
            };
            path: {
                tripId: string;
                entryId: string;
                attachmentId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
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
            413: {
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
            415: {
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
    viewers: {
        parameters: {
            query?: never;
            header: {
                "X-User-Id": string;
            };
            path: {
                tripId: string;
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
                    "*/*": components["schemas"]["TravelViewer"][];
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
            413: {
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
            415: {
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
    invite: {
        parameters: {
            query?: never;
            header: {
                "X-User-Id": string;
            };
            path: {
                tripId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TravelInviteViewer"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["TravelViewer"];
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
            413: {
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
            415: {
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
    revoke: {
        parameters: {
            query?: never;
            header: {
                "X-User-Id": string;
            };
            path: {
                tripId: string;
                viewerId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
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
            413: {
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
            415: {
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
            413: {
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
            415: {
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
            header: {
                "X-User-Id": string;
            };
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
            413: {
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
            415: {
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
            header: {
                "X-User-Id": string;
            };
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
            413: {
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
            415: {
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
            header: {
                "X-User-Id": string;
            };
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
            413: {
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
            415: {
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
    create_1: {
        parameters: {
            query?: never;
            header: {
                "X-User-Id": string;
            };
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
            413: {
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
            415: {
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
            header: {
                "X-User-Id": string;
            };
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
            413: {
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
            415: {
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
            header: {
                "X-User-Id": string;
            };
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
            413: {
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
            415: {
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
            413: {
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
            415: {
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
    list: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ListRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PageAppEntity"];
                };
            };
        };
    };
    get_2: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
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
                    "*/*": components["schemas"]["AppEntity"];
                };
            };
        };
    };
    publicAsset: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                project: string;
                path: string;
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
                    "*/*": string;
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
                "application/json": components["schemas"]["Create"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": {
                        [key: string]: Record<string, never>;
                    };
                };
            };
        };
    };
    view: {
        parameters: {
            query?: never;
            header?: {
                "X-Tierlist-Token"?: string;
            };
            path: {
                code: string;
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
                    "*/*": {
                        [key: string]: Record<string, never>;
                    };
                };
            };
        };
    };
    action: {
        parameters: {
            query?: never;
            header?: {
                "X-Tierlist-Token"?: string;
            };
            path: {
                code: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["Action"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": {
                        [key: string]: boolean;
                    };
                };
            };
        };
    };
    join: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                code: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["Join"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": {
                        [key: string]: Record<string, never>;
                    };
                };
            };
        };
    };
}
