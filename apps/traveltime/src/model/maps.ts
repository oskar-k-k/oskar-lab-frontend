/** Uses only the selected station's saved place and address, never the rest of the booking. */
export function mapQuery(placeName: string, address: string): string {
  const place = placeName.trim();
  const street = address.trim();
  if (!place || street.toLowerCase().includes(place.toLowerCase())) return street || place;
  return [place, street].filter(Boolean).join(", ");
}

/** Builds an official, key-free Google Maps link for the selected station. */
export function googleMapsLink(query: string): string {
  const url = new URL("https://www.google.com/maps/search/");
  url.search = new URLSearchParams({ api: "1", query }).toString();
  return url.toString();
}

/** Opens the saved venue in normal Maps; embed-only URLs remain restricted to the iframe. */
export function googleMapsPlaceLink(embed: string | null, query: string): string {
  const validated = embed ? parseMapEmbedUrl(embed) : null;
  if (validated) {
    const data = new URL(validated).searchParams.get("pb") ?? "";
    const cid = data.match(/!1s0x[0-9a-f]+:0x([0-9a-f]{1,16})(?:!|$)/i)?.[1];
    if (cid && BigInt("0x" + cid) > BigInt(0)) {
      const url = new URL("https://www.google.com/maps");
      url.searchParams.set("cid", BigInt("0x" + cid).toString());
      return url.toString();
    }
    const placeId = data.match(/!1s(ChI[A-Za-z0-9_-]+)(?:!|$)/)?.[1];
    if (placeId) {
      const url = new URL(googleMapsLink(query));
      url.searchParams.set("query_place_id", placeId);
      return url.toString();
    }
  }
  return googleMapsLink(query);
}

/** Extracts a key-free Google share embed from its URL or the copied iframe HTML. */
export function parseMapEmbedUrl(input: string): string | null {
  const value = input.trim();
  if (!value) return null;
  const source = value.startsWith("<")
    ? value.match(/<iframe\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/i)?.[1]?.replaceAll("&amp;", "&")
    : value;
  if (!source) return null;
  try {
    const url = new URL(source);
    if (source.length > 16000 || url.protocol !== "https:" || url.hostname !== "www.google.com" ||
      url.username || url.password || url.port || url.hash || url.pathname !== "/maps/embed") return null;
    const seen = new Set<string>();
    for (const [key, parameter] of url.searchParams) {
      if (!["pb", "hl"].includes(key) || seen.has(key) || !parameter.trim()) return null;
      seen.add(key);
    }
    return seen.has("pb") ? url.toString() : null;
  } catch { return null; }
}
