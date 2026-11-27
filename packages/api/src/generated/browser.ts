export interface paths {
    "/api/apps": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["appCatalog"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
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
    "/api/travel": {
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
    "/api/travel/{tripId}": {
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
    "/api/travel/{tripId}/entries": {
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
    "/api/travel/{tripId}/entries/{entryId}": {
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
    "/api/travel/{tripId}/entries/{entryId}/attachments": {
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
    "/api/travel/{tripId}/entries/{entryId}/attachments/{attachmentId}": {
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
    "/api/travel/{tripId}/packing": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["packing"];
        put: operations["savePacking"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/travel/{tripId}/saved": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["savedPlaces"];
        put?: never;
        post: operations["createSavedPlace"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/travel/{tripId}/saved/{placeId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["updateSavedPlace"];
        post?: never;
        delete: operations["deleteSavedPlace"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/travel/{tripId}/viewers": {
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
    "/api/travel/{tripId}/viewers/{viewerId}": {
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
        post: operations["create_1"];
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
        PackingGroup: {
            /** Format: uuid */
            id: string;
            items: components["schemas"]["PackingItem"][];
            name: string;
        };
        PackingItem: {
            checked: boolean;
            /** Format: uuid */
            id: string;
            name: string;
        };
        PackingList: {
            people: components["schemas"]["PackingPerson"][];
            /** Format: int64 */
            version: number;
        };
        PackingPerson: {
            groups: components["schemas"]["PackingGroup"][];
            /** Format: uuid */
            id: string;
            name: string;
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
            /**
             * Format: date
             * @description Optional planned local date; defaults to the booking date when a planned time is supplied
             */
            timelineDate: string | null;
            /**
             * Format: time-local
             * @description Optional personal planned time for any station; the timeline falls back to the booked time when absent
             */
            timelineTime: string | null;
            timelineUtcOffset: string | null;
            /** @enum {string} */
            timeMeaning: "EXACT" | "NOT_BEFORE" | "NOT_AFTER" | "UNSPECIFIED";
            timeZone: string;
            utcOffset: string | null;
        };
        TravelSavedPlace: {
            /** Format: uuid */
            id: string;
            notes: string;
            title: string;
            /** Format: uuid */
            tripId: string;
            url: string;
            /** Format: int64 */
            version: number;
        };
        TravelSavedPlacePage: {
            hasMore: boolean;
            places: components["schemas"]["TravelSavedPlace"][];
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
        TravelSavePlace: {
            notes?: string;
            title: string;
            url?: string;
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
    appCatalog: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Public app catalog */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PageAppEntity"];
                };
            };
            /** @description Catalog temporarily unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
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
    list_3: {
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
            header?: never;
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
            header?: never;
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
            header?: never;
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
            header?: never;
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
            header?: never;
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
            header?: never;
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
            header?: never;
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
            header?: never;
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
            header?: never;
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
            header?: never;
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
            header?: never;
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
            header?: never;
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
            header?: never;
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
    packing: {
        parameters: {
            query?: never;
            header?: never;
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
                    "*/*": components["schemas"]["PackingList"];
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
    savePacking: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                tripId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PackingList"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PackingList"];
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
    savedPlaces: {
        parameters: {
            query?: {
                page?: number;
            };
            header?: never;
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
                    "*/*": components["schemas"]["TravelSavedPlacePage"];
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
    createSavedPlace: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                tripId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TravelSavePlace"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["TravelSavedPlace"];
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
    updateSavedPlace: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                tripId: string;
                placeId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TravelSavePlace"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["TravelSavedPlace"];
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
    deleteSavedPlace: {
        parameters: {
            query: {
                version: number;
            };
            header?: never;
            path: {
                tripId: string;
                placeId: string;
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
            header?: never;
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
            header?: never;
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
            header?: never;
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
}
