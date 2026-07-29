"use client";

import { useState } from "react";
import type { ArtistSummary } from "@/lib/schedule";
import type { Location } from "@/lib/types";
import { settlementColor } from "@/lib/settlementColors";
import { InfoFooter } from "./InfoFooter";

type Props = {
  artists: ArtistSummary[];
  venues: Location[];
  onOpenProgram: (id: number) => void;
  onSelectVenue: (venueId: number) => void;
  onOpenInfo: () => void;
};

export function SearchView({
  artists,
  venues,
  onOpenProgram,
  onSelectVenue,
  onOpenInfo,
}: Props) {
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();
  const filteredArtists = normalizedQuery
    ? artists.filter((a) => a.name.toLowerCase().includes(normalizedQuery))
    : artists;
  const filteredVenues = normalizedQuery
    ? venues.filter((v) => v.name.toLowerCase().includes(normalizedQuery))
    : venues;

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col px-4 py-6">
      <p className="mb-2 text-sm text-ink/70">
        Kereshetsz előadókra és helyszínekre is.
      </p>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Keresés előadók és helyszínek között…"
        className="mb-4 shrink-0 rounded border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-accent focus:outline-none"
      />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <h3 className="mb-1.5 font-display text-sm font-medium text-ink">
          Helyszínek
        </h3>
        {filteredVenues.length === 0 ? (
          <p className="mb-4 text-sm text-ink/70">
            Nincs a keresésnek megfelelő helyszín.
          </p>
        ) : (
          <ul className="mb-4 divide-y divide-line">
            {filteredVenues.map((venue) => (
              <li key={venue.id}>
                <button
                  onClick={() => onSelectVenue(venue.id)}
                  className="flex w-full items-center gap-2 py-2.5 text-left font-medium text-ink hover:text-accent"
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: settlementColor(venue.city).solid }}
                    title={venue.city ?? undefined}
                  />
                  {venue.name}
                </button>
              </li>
            ))}
          </ul>
        )}

        <h3 className="mb-1.5 font-display text-sm font-medium text-ink">
          Előadók
        </h3>
        {filteredArtists.length === 0 ? (
          <p className="text-center font-body text-ink/70">
            Nincs a keresésnek megfelelő előadó.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {filteredArtists.map((artist) => (
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
        <InfoFooter onOpenInfo={onOpenInfo} />
      </div>
    </div>
  );
}
