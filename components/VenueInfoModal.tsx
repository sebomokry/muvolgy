"use client";

import type { Location } from "@/lib/types";
import { VenueDetails } from "./VenueDetails";

type Props = {
  venue: Location;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClose: () => void;
};

export function VenueInfoModal({
  venue,
  isFavorite,
  onToggleFavorite,
  onClose,
}: Props) {
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

        <button
          onClick={onToggleFavorite}
          className={`mt-4 flex w-full items-center justify-center gap-2 rounded border px-4 py-2 font-display text-sm font-medium transition-colors ${
            isFavorite
              ? "border-danger bg-danger-soft text-danger"
              : "border-line text-ink hover:bg-ink/5"
          }`}
        >
          {isFavorite
            ? "★ Eltávolítás a kedvenc helyszínek közül"
            : "☆ Hozzáadás a kedvenc helyszínekhez"}
        </button>
      </div>
    </div>
  );
}
