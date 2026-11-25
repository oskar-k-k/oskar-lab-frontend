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

/** Builds an official place-mode embed; the key must be restricted to this origin and Embed API. */
export function googleMapsEmbed(query: string, publicKey: string, locale: string): string {
  const url = new URL("https://www.google.com/maps/embed/v1/place");
  url.search = new URLSearchParams({ key: publicKey, q: query, zoom: "16", language: locale }).toString();
  return url.toString();
}
