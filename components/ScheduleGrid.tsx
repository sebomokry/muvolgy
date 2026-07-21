"use client";

import { useState } from "react";
import type { Location, Program } from "@/lib/types";
import { extraArtists, formatTime, isMusicProgram } from "@/lib/schedule";
import { categoryColor } from "@/lib/categoryColors";
import { VenueInfoModal } from "./VenueInfoModal";

const PX_PER_MIN = 1.4;
// Only a guard against zero/negative-duration bad data — real block widths
// always reflect the program's actual duration, never padded out further,
// so the block never visually overruns its real end time.
const MIN_BLOCK_WIDTH = 6;
const LANE_HEIGHT = 64;
const VENUE_COL_WIDTH = 96;
const HEADER_HEIGHT = 36;

type LaneItem = { program: Program; lane: number; laneCount: number };

/** Greedy interval-graph lane assignment so overlapping programs in the same venue render stacked instead of overlapping. */
function layoutLanes(programs: Program[]): LaneItem[] {
  const sorted = [...programs].sort((a, b) => a.startTs - b.startTs);
  const active: { endTs: number; lane: number }[] = [];
  const assigned: { program: Program; lane: number }[] = [];
  let laneCount = 0;

  for (const program of sorted) {
    for (let i = active.length - 1; i >= 0; i--) {
      if (active[i].endTs <= program.startTs) active.splice(i, 1);
    }
    const usedLanes = new Set(active.map((a) => a.lane));
    let lane = 0;
    while (usedLanes.has(lane)) lane++;
    active.push({ endTs: program.endTs, lane });
    laneCount = Math.max(laneCount, lane + 1);
    assigned.push({ program, lane });
  }

  return assigned.map((a) => ({ ...a, laneCount }));
}

type Props = {
  venues: Location[];
  programsByVenue: Map<number, Program[]>;
  rangeStartTs: number;
  rangeEndTs: number;
  selectedIds: Set<number>;
  conflictIds: Set<number>;
  favoriteIds: Set<number>;
  onToggleFavorite: (venueId: number) => void;
  onOpenProgram: (id: number) => void;
};

export function ScheduleGrid({
  venues,
  programsByVenue,
  rangeStartTs,
  rangeEndTs,
  selectedIds,
  conflictIds,
  favoriteIds,
  onToggleFavorite,
  onOpenProgram,
}: Props) {
  const [openVenueId, setOpenVenueId] = useState<number | null>(null);
  const openVenue = venues.find((v) => v.id === openVenueId) ?? null;

  const totalMinutes = (rangeEndTs - rangeStartTs) / 60000;
  const gridWidth = totalMinutes * PX_PER_MIN;

  const hourMarks: number[] = [];
  for (let ts = rangeStartTs; ts <= rangeEndTs; ts += 60 * 60 * 1000) {
    hourMarks.push(ts);
  }

  if (venues.length === 0) {
    return (
      <p className="py-12 text-center font-body text-ink/50">
        Nincs megjeleníthető program ezen a napon a kiválasztott szűrőkkel.
      </p>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-auto">
      <div
        className="sticky top-0 z-20 flex w-max shrink-0 bg-paper"
        style={{ height: HEADER_HEIGHT }}
      >
        <div
          className="sticky left-0 z-10 shrink-0 border-b border-r border-line bg-paper"
          style={{ width: VENUE_COL_WIDTH }}
        />
        <div
          className="relative shrink-0 border-b border-line"
          style={{ width: gridWidth }}
        >
          {hourMarks.map((ts) => (
            <div
              key={ts}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-xs text-ink/40"
              style={{ left: ((ts - rangeStartTs) / 60000) * PX_PER_MIN }}
            >
              {formatTime(ts)}
            </div>
          ))}
        </div>
      </div>

      {venues.map((venue) => {
        const lanes = layoutLanes(programsByVenue.get(venue.id) ?? []);
        const laneCount = lanes[0]?.laneCount ?? 1;
        const rowHeight = laneCount * LANE_HEIGHT;
        const isFavorite = favoriteIds.has(venue.id);
        const hasSelectedProgram =
          !isFavorite &&
          (programsByVenue.get(venue.id) ?? []).some((p) =>
            selectedIds.has(p.id),
          );
        return (
          <div
            key={venue.id}
            className="flex w-max shrink-0 border-b border-line/60 last:border-b-0"
          >
            <div
              className={`sticky left-0 z-10 flex shrink-0 flex-col items-center justify-center gap-0.5 border-r px-1 py-1 text-center font-display ${
                isFavorite
                  ? "border-accent bg-accent-soft text-accent"
                  : hasSelectedProgram
                    ? "border-pin bg-pin-soft text-pin"
                    : "border-line bg-paper text-ink"
              }`}
              style={{ width: VENUE_COL_WIDTH, height: rowHeight }}
            >
              <button
                onClick={() => setOpenVenueId(venue.id)}
                className="flex flex-col items-center gap-0.5 whitespace-normal text-[11px] leading-tight font-medium hover:underline"
                title={venue.name}
              >
                <span className="text-xs leading-none">
                  {isFavorite ? "★" : "☆"}
                </span>
                {venue.name}
              </button>
            </div>
            <div
              className="relative shrink-0"
              style={{ width: gridWidth, height: rowHeight }}
            >
              {lanes.map(({ program, lane }) => {
                const left =
                  ((program.startTs - rangeStartTs) / 60000) * PX_PER_MIN;
                const width = Math.max(
                  MIN_BLOCK_WIDTH,
                  ((program.endTs - program.startTs) / 60000) * PX_PER_MIN,
                );
                const isSelected = selectedIds.has(program.id);
                const isConflict = isSelected && conflictIds.has(program.id);
                const color = categoryColor(
                  program.categories[0]?.name ?? "",
                );
                const artists = extraArtists(program.name, program.artists);
                const artistText =
                  artists.length > 0
                    ? artists.map((a) => a.name).join(", ")
                    : null;
                // For music programs the title is usually the act's own name (even
                // when the source data only tags individual members as artists, e.g.
                // "Zækar" / ["Ambrus Andris", ...]) — so it's the headline there,
                // with any distinct artist names as a smaller subtitle. Non-music
                // programs keep the named speaker/artist as the headline instead.
                const musicProgram = isMusicProgram(program.categories);
                const headline = musicProgram
                  ? program.name
                  : (artistText ?? program.name);
                const subtitle = musicProgram
                  ? artistText
                  : artistText
                    ? program.name
                    : null;
                return (
                  <button
                    key={program.id}
                    onClick={() => onOpenProgram(program.id)}
                    className={`absolute overflow-hidden border-l-[3px] bg-paper px-1.5 py-1 text-left text-[9px] leading-tight transition-shadow hover:shadow-md ${
                      isConflict
                        ? "shadow-[0_0_0_2px_var(--danger)]"
                        : isSelected
                          ? "shadow-[0_0_0_2px_var(--accent)]"
                          : "shadow-[0_0_0_1px_var(--line)]"
                    }`}
                    style={{
                      left,
                      width,
                      top: `${(lane / laneCount) * 100}%`,
                      height: `${100 / laneCount}%`,
                      borderLeftColor: color,
                      backgroundColor: `${color}14`,
                    }}
                    title={program.name}
                  >
                    <div className="truncate whitespace-nowrap text-[13px] font-bold text-ink">
                      {headline}
                    </div>
                    {subtitle && (
                      <div className="mt-0.5 truncate whitespace-nowrap font-medium text-ink">
                        {subtitle}
                      </div>
                    )}
                    <div className="mt-0.5 truncate whitespace-nowrap font-mono text-ink/70">
                      {formatTime(program.startTs)}–{formatTime(program.endTs)}
                    </div>
                  </button>
                );
              })}
              {hourMarks.map((ts) => (
                <div
                  key={ts}
                  className="pointer-events-none absolute top-0 bottom-0 border-l border-line/50"
                  style={{ left: ((ts - rangeStartTs) / 60000) * PX_PER_MIN }}
                />
              ))}
            </div>
          </div>
        );
      })}
      {openVenue && (
        <VenueInfoModal
          venue={openVenue}
          isFavorite={favoriteIds.has(openVenue.id)}
          onToggleFavorite={() => onToggleFavorite(openVenue.id)}
          onClose={() => setOpenVenueId(null)}
        />
      )}
    </div>
  );
}
