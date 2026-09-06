const maxImageSize = 8 * 1024 * 1024;
const acceptedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const workerTimeoutMs = 15 * 60 * 1000;

function jsonError(error: string, status: number): Response {
    return Response.json({error}, {status});
}

function isValidImage(value: FormDataEntryValue | null): value is File {
    return value instanceof File && acceptedImageTypes.has(value.type) && value.size > 0 && value.size <= maxImageSize;
}

/** Proxies try-on uploads to a self-hosted GPU worker without exposing its URL to the browser. */
export async function POST(request: Request) {
    const workerUrl = process.env.TRYON_WORKER_URL;
    if (!workerUrl) {
        return jsonError("TRYON_WORKER_URL is not configured. Start the local GPU worker and set the frontend environment variable.", 503);
    }

    const formData = await request.formData();
    const person = formData.get("person");
    const garment = formData.get("garment");

    if (!isValidImage(person) || !isValidImage(garment)) {
        return jsonError("Upload one person image and one garment image as JPG, PNG, or WebP under 8 MB each.", 400);
    }

    const workerForm = new FormData();
    workerForm.set("person", person);
    workerForm.set("garment", garment);
    workerForm.set("category", String(formData.get("category") ?? "upper_body"));

    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), workerTimeoutMs);
    try {
        const response = await fetch(workerUrl, {
            method: "POST",
            body: workerForm,
            signal: abortController.signal,
        });

        if (!response.ok) {
            return jsonError(`The try-on worker failed with status ${response.status}.`, 502);
        }

        return new Response(response.body, {
            status: response.status,
            headers: {
                "content-type": response.headers.get("content-type") ?? "application/json",
                "cache-control": "no-store",
            },
        });
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
            return jsonError("The try-on worker timed out.", 504);
        }
        return jsonError("The try-on worker is unreachable.", 502);
    } finally {
        clearTimeout(timeout);
    }
}
