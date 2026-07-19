"use client";

import type { Program } from "@/lib/types";
import { formatTime } from "@/lib/schedule";
import { categoryColor } from "@/lib/categoryColors";

const PX_PER_MIN = 1.4;
const MIN_BLOCK_HEIGHT = 34;
const MIN_COLUMN_WIDTH = 200;
const LANE_WIDTH = 110;

type LaneItem = { program: Program; lane: number; laneCount: number };

/** Greedy interval-graph lane assignment so overlapping programs in the same venue render side by side instead of stacked. */
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
  venues: { id: number; name: string }[];
  programsByVenue: Map<number, Program[]>;
  rangeStartTs: number;
  rangeEndTs: number;
  selectedIds: Set<number>;
  conflictIds: Set<number>;
  favoriteIds: Set<number>;
  onToggle: (id: number) => void;
  onToggleFavorite: (venueId: number) => void;
};

export function ScheduleGrid({
  venues,
  programsByVenue,
  rangeStartTs,
  rangeEndTs,
  selectedIds,
  conflictIds,
  favoriteIds,
  onToggle,
  onToggleFavorite,
}: Props) {
  const totalMinutes = (rangeEndTs - rangeStartTs) / 60000;
  const gridHeight = totalMinutes * PX_PER_MIN;

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
    <div className="flex h-full overflow-auto">
      <div
        className="sticky left-0 z-20 shrink-0 border-r border-line bg-paper"
        style={{ width: 56, height: gridHeight + 36 }}
      >
        <div className="sticky top-0 z-10 h-9 bg-paper" />
        {hourMarks.map((ts) => (
          <div
            key={ts}
            className="absolute left-0 w-14 -translate-y-1/2 pr-2 text-right font-mono text-xs text-ink/40"
            style={{ top: 36 + ((ts - rangeStartTs) / 60000) * PX_PER_MIN }}
          >
            {formatTime(ts)}
          </div>
        ))}
      </div>

      {venues.map((venue) => {
        const lanes = layoutLanes(programsByVenue.get(venue.id) ?? []);
        const laneCount = lanes[0]?.laneCount ?? 1;
        const columnWidth = Math.max(MIN_COLUMN_WIDTH, laneCount * LANE_WIDTH);
        const isFavorite = favoriteIds.has(venue.id);
        return (
          <div
            key={venue.id}
            className="relative shrink-0 border-r border-line/60 last:border-r-0"
            style={{ width: columnWidth }}
          >
            <div
              className={`sticky top-0 z-10 flex h-9 items-center gap-1.5 border-b px-2 font-display text-sm font-medium ${
                isFavorite
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-line bg-paper text-ink"
              }`}
            >
              <button
                onClick={() => onToggleFavorite(venue.id)}
                className={`shrink-0 leading-none ${isFavorite ? "text-accent" : "text-ink/25 hover:text-ink/60"}`}
                aria-label={
                  isFavorite ? "Eltávolítás a kedvencekből" : "Kedvencekhez adás"
                }
                title={isFavorite ? "Eltávolítás a kedvencekből" : "Kedvencekhez adás"}
              >
                {isFavorite ? "★" : "☆"}
              </button>
              <span className="truncate">{venue.name}</span>
            </div>
            <div className="relative" style={{ height: gridHeight }}>
              {hourMarks.map((ts) => (
                <div
                  key={ts}
                  className="absolute left-0 right-0 border-t border-line/50"
                  style={{ top: ((ts - rangeStartTs) / 60000) * PX_PER_MIN }}
                />
              ))}
              {lanes.map(({ program, lane, laneCount }) => {
                const top =
                  ((program.startTs - rangeStartTs) / 60000) * PX_PER_MIN;
                const height = Math.max(
                  MIN_BLOCK_HEIGHT,
                  ((program.endTs - program.startTs) / 60000) * PX_PER_MIN,
                );
                const isSelected = selectedIds.has(program.id);
                const isConflict = isSelected && conflictIds.has(program.id);
                const color = categoryColor(
                  program.categories[0]?.name ?? "",
                );
                return (
                  <button
                    key={program.id}
                    onClick={() => onToggle(program.id)}
                    className={`absolute overflow-hidden border-l-[3px] bg-paper px-1.5 py-1 text-left text-[11px] leading-tight transition-shadow hover:shadow-md ${
                      isConflict
                        ? "shadow-[0_0_0_2px_var(--danger)]"
                        : isSelected
                          ? "shadow-[0_0_0_2px_var(--accent)]"
                          : "shadow-[0_0_0_1px_var(--line)]"
                    }`}
                    style={{
                      top,
                      height,
                      left: `${(lane / laneCount) * 100}%`,
                      width: `${100 / laneCount}%`,
                      borderLeftColor: color,
                      backgroundColor: `${color}14`,
                    }}
                    title={program.name}
                  >
                    <div className="font-mono text-ink/60">
                      {formatTime(program.startTs)}–{formatTime(program.endTs)}
                    </div>
                    <div className="font-medium text-ink">{program.name}</div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
