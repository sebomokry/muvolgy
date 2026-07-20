"use client";

import type { Program } from "@/lib/types";
import { extraArtists, formatDay, formatTime } from "@/lib/schedule";
import { VenueDetails } from "./VenueDetails";

type Props = {
  program: Program;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClose: () => void;
};

export function ProgramInfoModal({
  program,
  isFavorite,
  onToggleFavorite,
  onClose,
}: Props) {
  const artists = extraArtists(program.name, program.artists);

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
            {program.name}
          </h2>
          <button
            onClick={onClose}
            className="shrink-0 font-mono text-ink/40 hover:text-ink"
            aria-label="Bezárás"
          >
            ✕
          </button>
        </div>

        {artists.length > 0 && (
          <p className="mt-1 text-sm text-ink/70">{artists.join(", ")}</p>
        )}

        <p className="mt-1 font-mono text-xs text-ink/50">
          {formatDay(program.day)} · {formatTime(program.startTs)}–
          {formatTime(program.endTs)}
        </p>

        {program.location ? (
          <div className="mt-3">
            <p className="font-display text-sm font-medium text-ink">
              {program.location.name}
            </p>
            <VenueDetails venue={program.location} />
          </div>
        ) : (
          <p className="mt-3 text-sm text-ink/50">
            Nincs megadva helyszín ehhez a programhoz.
          </p>
        )}

        <button
          onClick={onToggleFavorite}
          className={`mt-4 flex w-full items-center justify-center gap-2 rounded border px-4 py-2 font-display text-sm font-medium transition-colors ${
            isFavorite
              ? "border-accent bg-accent-soft text-accent"
              : "border-line text-ink hover:bg-ink/5"
          }`}
        >
          {isFavorite
            ? "★ Eltávolítás a kedvencekből"
            : "☆ Hozzáadás a kedvencekhez"}
        </button>
      </div>
    </div>
  );
}
