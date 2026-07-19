"use client";

import type { Location } from "@/lib/types";
import { mapsLink } from "@/lib/maps";

type Props = {
  venue: Location;
  onClose: () => void;
};

export function VenueInfoModal({ venue, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-ink/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded border border-line bg-paper p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-lg font-medium text-ink">
            {venue.name}
          </h2>
          <button
            onClick={onClose}
            className="shrink-0 font-mono text-ink/40 hover:text-ink"
            aria-label="Bezárás"
          >
            ✕
          </button>
        </div>

        {venue.city && (
          <p className="mt-1 font-mono text-xs uppercase tracking-wide text-ink/50">
            {venue.city}
          </p>
        )}

        <p className="mt-3 text-sm text-ink/80">
          {venue.address ?? "Pontos cím nincs megadva ehhez a helyszínhez."}
        </p>

        <a
          href={mapsLink(venue)}
          target="_blank"
          rel="noreferrer"
          className="mt-4 flex items-center justify-center gap-2 rounded bg-accent px-4 py-2 font-display text-sm font-medium text-paper transition-opacity hover:opacity-90"
        >
          Megnyitás térképen
        </a>
      </div>
    </div>
  );
}
