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
      className="fixed inset-0 z-30 flex items-center justify-center bg-ink/25 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-sm overflow-y-auto rounded-3xl bg-paper p-6 shadow-2xl shadow-ink/20 ring-1 ring-ink/5"
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
          className={`mt-4 flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2.5 font-display text-sm font-medium transition-colors ${
            isFavorite
              ? "border-danger bg-danger-soft text-danger"
              : "border-transparent bg-ink/5 text-ink hover:bg-ink/10"
          }`}
        >
          {isFavorite
            ? "★ Eltávolítás a Kedvenc helyszínek közül"
            : "☆ Hozzáadás a Kedvenc helyszínekhez"}
        </button>
      </div>
    </div>
  );
}
