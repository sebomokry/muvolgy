"use client";

import type { Location } from "@/lib/types";
import { mapsLink } from "@/lib/maps";

export function VenueDetails({ venue }: { venue: Location }) {
  return (
    <>
      {venue.city && (
        <p className="font-mono text-xs uppercase tracking-wide text-ink/50">
          {venue.city}
        </p>
      )}

      <p className="mt-1 text-sm text-ink/80">
        {venue.address ?? "Pontos cím nincs megadva ehhez a helyszínhez."}
      </p>

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
