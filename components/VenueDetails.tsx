"use client";

import type { Location } from "@/lib/types";
import { mapsLink } from "@/lib/maps";
import { settlementColor } from "@/lib/settlementColors";
import { CopyButton } from "./CopyButton";

type Props = {
  venue: Location;
  showOfficialLink?: boolean;
};

export function VenueDetails({ venue, showOfficialLink = true }: Props) {
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

      <div className="mt-1 flex items-start gap-1.5">
        <p className="text-sm text-ink/80">
          {venue.address
            ? `Cím: ${venue.address}`
            : "Nincs pontos cím, de kattints, a Google általában megtalálja :)"}
        </p>
        {venue.address && (
          <CopyButton value={venue.address} label="Cím másolása" />
        )}
      </div>

      {venue.coords && (
        <div className="mt-0.5 flex items-center gap-1.5">
          <p className="font-mono text-xs text-ink/70">
            Koordináta: {venue.coords[0].toFixed(5)}, {venue.coords[1].toFixed(5)}
          </p>
          <CopyButton
            value={`${venue.coords[0]}, ${venue.coords[1]}`}
            label="Koordináták másolása"
          />
        </div>
      )}

      <a
        href={mapsLink(venue)}
        target="_blank"
        rel="noreferrer"
        className="mt-3 flex items-center justify-center gap-2 rounded bg-accent px-4 py-2 font-display text-sm font-medium text-paper transition-opacity hover:opacity-90"
      >
        Megnyitás térképen
      </a>

      {showOfficialLink && (
        <a
          href={`https://www.muveszetekvolgye.hu/location/${venue.id}`}
          target="_blank"
          rel="noreferrer"
          className="mt-2 flex items-center justify-center gap-2 rounded border border-ink px-4 py-2 font-display text-sm font-medium text-ink transition-colors hover:bg-ink/5"
        >
          Helyszín a hivatalos oldalon
        </a>
      )}
    </>
  );
}
