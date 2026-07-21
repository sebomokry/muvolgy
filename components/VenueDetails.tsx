"use client";

import type { Location } from "@/lib/types";
import { mapsLink } from "@/lib/maps";
import { settlementColor } from "@/lib/settlementColors";

export function VenueDetails({ venue }: { venue: Location }) {
  return (
    <>
      {venue.city && (
        <span
          className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium text-paper"
          style={{ backgroundColor: settlementColor(venue.city).solid }}
        >
          {venue.city}
        </span>
      )}

      <p className="mt-1 text-sm text-ink/80">
        {venue.address ?? "Nincs pontos cím, de kattints, a Google általában megtalálja :)"}
      </p>

      {venue.coords && (
        <p className="mt-0.5 font-mono text-xs text-ink/50">
          {venue.coords[0].toFixed(5)}, {venue.coords[1].toFixed(5)}
        </p>
      )}

      <a
        href={mapsLink(venue)}
        target="_blank"
        rel="noreferrer"
        className="mt-3 flex items-center justify-center gap-2 rounded bg-accent px-4 py-2 font-display text-sm font-medium text-paper transition-opacity hover:opacity-90"
      >
        Megnyitás térképen
      </a>
    </>
  );
}
