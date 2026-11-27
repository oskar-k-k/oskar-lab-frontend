import { getCurrentUser } from "@oskar-lab/auth/platformUser";
const uuid = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const routes = new RegExp(
  `^(?:${uuid}(?:/(?:packing|entries(?:/${uuid}(?:/attachments(?:/${uuid})?)?)?|viewers(?:/${uuid})?))?)?$`,
  "i",
);
const headers = {
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, noarchive, nosnippet",
};
/** Restricts the browser adapter to travel resources and derives identity exclusively from the central session. */
async function proxy(
  request: Request,
  context: { params: Promise<{ path?: string[] }> },
) {
  const path = (await context.params).path?.join("/") ?? "";
  if (!routes.test(path))
    return Response.json({ code: "notFound" }, { status: 404, headers });
  const url = new URL(request.url);
  const origins = new Set([
    url.origin,
    new URL(process.env.AUTH_PLATFORM_URL ?? "http://localhost:10030").origin,
  ]);
  if (
    request.method !== "GET" &&
    !origins.has(request.headers.get("origin") ?? "")
  )
    return Response.json({ code: "forbidden" }, { status: 403, headers });
  const query = new URLSearchParams();
  for (const [key, value] of url.searchParams) {
    if ((key === "page" || key === "version") && /^\d{1,8}$/.test(value))
      query.set(key, value);
    else if (
      key === "pointRole" &&
      /^(DEPARTURE|ARRIVAL|CHECK_IN|CHECK_OUT|START|END)$/.test(value)
    )
      query.set(key, value);
    else
      return Response.json({ code: "invalidTravel" }, { status: 400, headers });
  }
  try {
    const user = await getCurrentUser();
    if (!user)
      return Response.json({ code: "unauthorized" }, { status: 401, headers });
    const secret = process.env.AUTH_BRIDGE_SECRET;
    if (!secret || secret.length < 32)
      return Response.json({ code: "unavailable" }, { status: 503, headers });
    let body: ArrayBuffer | undefined;
    if (request.method === "POST" || request.method === "PUT") {
      const limit = path.endsWith("/attachments") ? 6 * 1024 * 1024 : path.endsWith("/packing") ? 600000 : 100000;
      const reader = request.body?.getReader();
      const chunks: Uint8Array[] = [];
      let length = 0;
      if (reader)
        for (;;) {
          const part = await reader.read();
          if (part.done) break;
          length += part.value.length;
          if (length > limit) {
            await reader.cancel();
            return Response.json(
              { code: "fileTooLarge" },
              { status: 413, headers },
            );
          }
          chunks.push(part.value);
        }
      const bytes = new Uint8Array(length);
      let offset = 0;
      for (const chunk of chunks) {
        bytes.set(chunk, offset);
        offset += chunk.length;
      }
      body = bytes.buffer;
    }
    const upstream = await fetch(
      `${process.env.AUTH_BACKEND_URL ?? "http://localhost:10081"}/internal/travel/trips${path ? "/" + path : ""}?${query}`,
      {
        method: request.method,
        headers: {
          "X-Auth-Bridge": secret,
          "X-User-Id": user.id,
          ...(body
            ? {
                "Content-Type":
                  request.headers.get("content-type") ?? "application/json",
              }
            : {}),
        },
        body,
        cache: "no-store",
        signal: AbortSignal.timeout(45000),
        redirect: "error",
      },
    );
    const output = new Headers(headers);
    for (const key of [
      "content-type",
      "content-disposition",
      "content-security-policy",
    ]) {
      const value = upstream.headers.get(key);
      if (value) output.set(key, value);
    }
    return new Response(upstream.status === 204 ? null : upstream.body, {
      status: upstream.status,
      headers: output,
    });
  } catch {
    return Response.json({ code: "unavailable" }, { status: 503, headers });
  }
}
export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
