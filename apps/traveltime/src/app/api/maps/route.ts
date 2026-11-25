import { getCurrentUser } from "@oskar-lab/auth/platformUser";
const headers = {
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
};
/** Returns only a deliberately public, origin-restricted Embed key to signed-in users; never geocodes locations. */
export async function GET() {
  try {
    if (!(await getCurrentUser()))
      return Response.json({ code: "unauthorized" }, { status: 401, headers });
    const publicKey = process.env.GOOGLE_MAPS_EMBED_PUBLIC_KEY;
    if (!publicKey)
      return Response.json({ code: "mapsUnavailable" }, { status: 503, headers });
    return Response.json({ publicKey }, { headers });
  } catch {
    return Response.json({ code: "unavailable" }, { status: 503, headers });
  }
}
