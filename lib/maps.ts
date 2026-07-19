import type { Location } from "./types";

/** Best available query for this venue: precise coords, then address, then a name+city guess. */
export function mapsLink(location: Location): string {
  const query = location.coords
    ? `${location.coords[0]},${location.coords[1]}`
    : (location.address ??
      `${location.name}, ${location.city ?? ""}, Magyarország`);
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
