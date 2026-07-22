"use client";

import { useState } from "react";
import type { ArtistSummary } from "@/lib/schedule";

type Props = {
  artists: ArtistSummary[];
  onOpenProgram: (id: number) => void;
};

export function ArtistsView({ artists, onOpenProgram }: Props) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? artists.filter((a) =>
        a.name.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : artists;

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col px-4 py-6">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Keresés az előadók között…"
        className="mb-4 shrink-0 rounded border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-accent focus:outline-none"
      />
      <div className="min-h-0 flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-center font-body text-ink/70">
            Nincs a keresésnek megfelelő előadó.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {filtered.map((artist) => (
              <li key={artist.id}>
                <button
                  onClick={() => onOpenProgram(artist.firstProgramId)}
                  className="flex w-full items-center gap-2 py-2.5 text-left font-medium text-ink hover:text-accent"
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: artist.categoryColor }}
                    title={artist.categoryName}
                  />
                  {artist.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
