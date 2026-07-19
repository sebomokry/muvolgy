"use client";

import { useMemo, useState } from "react";
import type { FestivalData, Program } from "@/lib/types";
import {
  conflictingIds,
  programsForDay,
  sortVenuesWithFavoritesFirst,
  splitAllDay,
  timeRangeFor,
  venuesForPrograms,
  formatTime,
} from "@/lib/schedule";
import { useSelectedPrograms } from "@/hooks/useSelectedPrograms";
import { useFavoriteVenues } from "@/hooks/useFavoriteVenues";
import { DateTabs } from "./DateTabs";
import { CategoryFilter } from "./CategoryFilter";
import { ScheduleGrid } from "./ScheduleGrid";
import { SelectedPanel } from "./SelectedPanel";

const DEFAULT_CATEGORY = "Könnyűzene";

function defaultDay(days: string[]): string {
  const today = new Date().toISOString().slice(0, 10);
  return days.find((d) => d >= today) ?? days[0];
}

function defaultCategoryIds(categories: FestivalData["categories"]): Set<number> {
  const match = categories.filter((c) => c.name === DEFAULT_CATEGORY);
  return new Set((match.length > 0 ? match : categories).map((c) => c.id));
}

export function FestivalApp({ data }: { data: FestivalData }) {
  const [view, setView] = useState<"grid" | "mine">("grid");
  const [selectedDay, setSelectedDay] = useState(() => defaultDay(data.days));
  const [activeCategoryIds, setActiveCategoryIds] = useState<Set<number>>(
    () => defaultCategoryIds(data.categories),
  );
  const { selectedIds, toggle } = useSelectedPrograms();
  const { favoriteIds, toggle: toggleFavorite } = useFavoriteVenues();

  const toggleCategory = (id: number) => {
    setActiveCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const visiblePrograms = useMemo(() => {
    const dayPrograms = programsForDay(data.programs, selectedDay);
    return dayPrograms.filter(
      (p) =>
        p.categories.length === 0 ||
        p.categories.some((c) => activeCategoryIds.has(c.id)),
    );
  }, [data.programs, selectedDay, activeCategoryIds]);

  const { timed, allDay } = useMemo(
    () => splitAllDay(visiblePrograms),
    [visiblePrograms],
  );

  const venues = useMemo(() => {
    const found = venuesForPrograms(timed);
    return sortVenuesWithFavoritesFirst(found, favoriteIds);
  }, [timed, favoriteIds]);

  const programsByVenue = useMemo(() => {
    const map = new Map<number, Program[]>();
    for (const p of timed) {
      if (!p.location) continue;
      const list = map.get(p.location.id) ?? [];
      list.push(p);
      map.set(p.location.id, list);
    }
    return map;
  }, [timed]);

  const timeRange = useMemo(() => timeRangeFor(timed), [timed]);

  const selectedPrograms = useMemo(
    () => data.programs.filter((p) => selectedIds.has(p.id)),
    [data.programs, selectedIds],
  );
  const conflicts = useMemo(
    () => conflictingIds(selectedPrograms),
    [selectedPrograms],
  );

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-line px-4 py-2.5">
        <h1 className="truncate font-display text-lg font-medium text-ink">
          Művészetek Völgye
        </h1>
        <div className="flex shrink-0 gap-1 rounded-full border border-line p-0.5">
          <button
            onClick={() => setView("grid")}
            className={`rounded-full px-3 py-1 font-display text-sm transition-colors ${
              view === "grid" ? "bg-ink text-paper" : "text-ink/50 hover:text-ink"
            }`}
          >
            Rács
          </button>
          <button
            onClick={() => setView("mine")}
            className={`rounded-full px-3 py-1 font-display text-sm transition-colors ${
              view === "mine" ? "bg-ink text-paper" : "text-ink/50 hover:text-ink"
            }`}
          >
            Sajátjaim{selectedPrograms.length > 0 ? ` (${selectedPrograms.length})` : ""}
          </button>
        </div>
      </header>

      {view === "grid" && (
        <div className="flex shrink-0 flex-col gap-2 border-b border-line px-4 py-2.5">
          <DateTabs
            days={data.days}
            selectedDay={selectedDay}
            onSelect={setSelectedDay}
          />
          <CategoryFilter
            categories={data.categories}
            activeIds={activeCategoryIds}
            onToggle={toggleCategory}
            onAll={() =>
              setActiveCategoryIds(new Set(data.categories.map((c) => c.id)))
            }
            onNone={() => setActiveCategoryIds(new Set())}
          />
        </div>
      )}

      <div className="min-h-0 flex-1">
        {view === "grid" ? (
          <div className="flex h-full flex-col">
            {allDay.length > 0 && (
              <div className="flex shrink-0 flex-wrap gap-2 border-b border-line px-4 py-2">
                {allDay.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => toggle(p.id)}
                    className={`rounded border px-2 py-1 text-left text-xs ${
                      selectedIds.has(p.id)
                        ? "border-accent shadow-[0_0_0_2px_var(--accent-soft)]"
                        : "border-line"
                    }`}
                    title={p.name}
                  >
                    <span className="font-mono text-ink/50">
                      {formatTime(p.startTs)}–{formatTime(p.endTs)}
                    </span>{" "}
                    <span className="font-medium text-ink">{p.name}</span>
                    {p.location ? (
                      <span className="text-ink/40"> · {p.location.name}</span>
                    ) : null}
                  </button>
                ))}
              </div>
            )}
            <div className="min-h-0 flex-1">
              <ScheduleGrid
                venues={venues}
                programsByVenue={programsByVenue}
                rangeStartTs={timeRange.startTs}
                rangeEndTs={timeRange.endTs}
                selectedIds={selectedIds}
                conflictIds={conflicts}
                favoriteIds={favoriteIds}
                onToggle={toggle}
                onToggleFavorite={toggleFavorite}
              />
            </div>
          </div>
        ) : (
          <SelectedPanel
            programs={selectedPrograms}
            conflictIds={conflicts}
            onToggle={toggle}
          />
        )}
      </div>
    </div>
  );
}
