"use client";

import type { Location } from "@/lib/types";
import { VenueDetails } from "./VenueDetails";

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

        <VenueDetails venue={venue} />
      </div>
    </div>
  );
}
