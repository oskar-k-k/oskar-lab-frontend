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
