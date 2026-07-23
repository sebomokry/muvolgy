"use client";

import { useMemo, useState } from "react";
import type { FestivalData, Program } from "@/lib/types";
import {
  allArtists,
  allSettlements,
  conflictingIds,
  otherProgramsByArtists,
  programsForDay,
  sortVenuesWithFavoritesFirst,
  splitAllDay,
  timeRangeFor,
  venuesForPrograms,
  formatTime,
} from "@/lib/schedule";
import { useSelectedPrograms } from "@/hooks/useSelectedPrograms";
import { useFavoriteVenues } from "@/hooks/useFavoriteVenues";
import { useHasSeenIntro } from "@/hooks/useHasSeenIntro";
import { DateTabs } from "./DateTabs";
import { CategoryFilter } from "./CategoryFilter";
import { SettlementFilter } from "./SettlementFilter";
import { ScheduleGrid } from "./ScheduleGrid";
import { SelectedPanel } from "./SelectedPanel";
import { ArtistsView } from "./ArtistsView";
import { ProgramInfoModal } from "./ProgramInfoModal";
import { AppInfoModal } from "./AppInfoModal";

const DEFAULT_CATEGORY = "Könnyűzene";
const UNCATEGORIZED_ID = -1;

function defaultDay(days: string[]): string {
  const today = new Date().toISOString().slice(0, 10);
  return days.find((d) => d >= today) ?? days[0];
}

function defaultCategoryIds(categories: FestivalData["categories"]): Set<number> {
  const match = categories.filter((c) => c.name === DEFAULT_CATEGORY);
  return new Set((match.length > 0 ? match : categories).map((c) => c.id));
}

export function FestivalApp({ data }: { data: FestivalData }) {
  const [view, setView] = useState<"grid" | "mine" | "artists">("grid");
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(() => defaultDay(data.days));
  const [activeCategoryIds, setActiveCategoryIds] = useState<Set<number>>(
    () => defaultCategoryIds(data.categories),
  );
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const categoriesWithUncategorized = useMemo(
    () => [
      ...data.categories,
      { id: UNCATEGORIZED_ID, name: "Kategória nélküli", color: "", order: Infinity },
    ],
    [data.categories],
  );
  const settlements = useMemo(
    () => allSettlements(data.locations),
    [data.locations],
  );
  const [activeSettlements, setActiveSettlements] = useState<Set<string>>(
    () => new Set(settlements),
  );
  const { selectedIds, toggle } = useSelectedPrograms();
  const { favoriteIds, toggle: toggleFavorite } = useFavoriteVenues();
  const { hasSeenIntro, markSeen } = useHasSeenIntro();
  const [introDismissed, setIntroDismissed] = useState(false);
  const [introManuallyOpened, setIntroManuallyOpened] = useState(false);
  const introOpen =
    introManuallyOpened || (!hasSeenIntro && !introDismissed);
  const [openProgramId, setOpenProgramId] = useState<number | null>(null);
  const openProgram =
    data.programs.find((p) => p.id === openProgramId) ?? null;
  const relatedPrograms = useMemo(
    () => (openProgram ? otherProgramsByArtists(openProgram, data.programs) : []),
    [openProgram, data.programs],
  );
  const artists = useMemo(() => allArtists(data.programs), [data.programs]);

  const toggleCategory = (id: number) => {
    setActiveCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSettlement = (settlement: string) => {
    setActiveSettlements((prev) => {
      const next = new Set(prev);
      if (next.has(settlement)) next.delete(settlement);
      else next.add(settlement);
      return next;
    });
  };

  const visiblePrograms = useMemo(() => {
    const dayPrograms = programsForDay(data.programs, selectedDay);
    return dayPrograms.filter(
      (p) =>
        (onlyFavorites
          ? selectedIds.has(p.id)
          : p.categories.length === 0
            ? activeCategoryIds.has(UNCATEGORIZED_ID)
            : p.categories.some((c) => activeCategoryIds.has(c.id))) &&
        (!p.location?.city || activeSettlements.has(p.location.city)),
    );
  }, [
    data.programs,
    selectedDay,
    activeCategoryIds,
    activeSettlements,
    onlyFavorites,
    selectedIds,
  ]);

  const { timed, allDay } = useMemo(
    () => splitAllDay(visiblePrograms),
    [visiblePrograms],
  );

  const venueIdsWithSelectedProgram = useMemo(() => {
    const ids = new Set<number>();
    for (const p of timed) {
      if (p.location && selectedIds.has(p.id)) ids.add(p.location.id);
    }
    return ids;
  }, [timed, selectedIds]);

  const venues = useMemo(() => {
    const found = venuesForPrograms(timed);
    return sortVenuesWithFavoritesFirst(
      found,
      favoriteIds,
      venueIdsWithSelectedProgram,
    );
  }, [timed, favoriteIds, venueIdsWithSelectedProgram]);

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
          MűVölgy
        </h1>
        <div className="flex shrink-0 gap-1 rounded-full border border-line p-0.5">
          <button
            onClick={() => setView("grid")}
            className={`rounded-full px-3 py-1 font-display text-sm transition-colors ${
              view === "grid" ? "bg-ink text-paper" : "text-ink/70 hover:text-ink"
            }`}
          >
            Programtábla
          </button>
          <button
            onClick={() => setView("mine")}
            className={`rounded-full px-3 py-1 font-display text-sm transition-colors ${
              view === "mine" ? "bg-ink text-paper" : "text-ink/70 hover:text-ink"
            }`}
          >
            Kedvenceim{selectedPrograms.length > 0 ? ` (${selectedPrograms.length})` : ""}
          </button>
          <button
            onClick={() => setView("artists")}
            className={`rounded-full px-3 py-1 font-display text-sm transition-colors ${
              view === "artists" ? "bg-ink text-paper" : "text-ink/70 hover:text-ink"
            }`}
          >
            Előadók
          </button>
        </div>
      </header>

      {view === "grid" && (
        <div className="flex max-h-[60vh] shrink-0 flex-col gap-2 overflow-y-auto border-b border-line px-4 py-2.5">
          <DateTabs
            days={data.days}
            selectedDay={selectedDay}
            onSelect={setSelectedDay}
          />
          <div className="flex flex-wrap items-center gap-1.5">
            <SettlementFilter
              settlements={settlements}
              activeSettlements={activeSettlements}
              onToggle={toggleSettlement}
            />
            <button
              onClick={() => setCategoriesOpen((prev) => !prev)}
              // Width-only `sm:` would misfire on a landscape phone (wide
              // enough to cross 640px, but far too short vertically for an
              // always-expanded category list) — this needs both width AND
              // height, so it stays in sync with the wrapper div below.
              className={`flex items-center gap-1.5 self-start rounded-full border px-2.5 py-1 font-mono text-xs font-medium transition-colors [@media(min-width:640px)_and_(min-height:500px)]:hidden ${
                categoriesOpen
                  ? "border-transparent bg-ink text-paper"
                  : "border-line text-ink/60 hover:border-ink/30 hover:text-ink"
              }`}
            >
              <span>{categoriesOpen ? "▾" : "▸"}</span>
              Kategóriák ({activeCategoryIds.size})
            </button>
            <button
              onClick={() => {
                setOnlyFavorites((prev) => !prev);
                if (!onlyFavorites) setCategoriesOpen(false);
              }}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                onlyFavorites
                  ? "border-transparent text-paper"
                  : "border-line text-ink/70 hover:text-ink"
              }`}
              style={onlyFavorites ? { backgroundColor: "var(--saved)" } : undefined}
            >
              <span
                className={`h-2 w-2 rounded-full ${onlyFavorites ? "bg-paper" : ""}`}
                style={onlyFavorites ? undefined : { backgroundColor: "var(--saved)" }}
              />
              Csak a Kedvenceim
            </button>
          </div>
          <div
            // Must match the compound breakpoint on the "Kategóriák" toggle above.
            className={`${categoriesOpen ? "flex" : "hidden"} flex-col gap-1.5 [@media(min-width:640px)_and_(min-height:500px)]:flex`}
          >
            <CategoryFilter
              categories={categoriesWithUncategorized}
              activeIds={activeCategoryIds}
              onToggle={toggleCategory}
              onAll={() =>
                setActiveCategoryIds(
                  new Set(categoriesWithUncategorized.map((c) => c.id)),
                )
              }
              onNone={() => setActiveCategoryIds(new Set())}
              disabled={onlyFavorites}
            />
          </div>
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
                    <span className="font-mono text-ink/70">
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
                onToggleFavorite={toggleFavorite}
                onOpenProgram={setOpenProgramId}
                onOpenInfo={() => setIntroManuallyOpened(true)}
              />
            </div>
          </div>
        ) : view === "mine" ? (
          <SelectedPanel
            programs={selectedPrograms}
            conflictIds={conflicts}
            onOpenProgram={setOpenProgramId}
          />
        ) : (
          <ArtistsView artists={artists} onOpenProgram={setOpenProgramId} />
        )}
      </div>
      {openProgram && (
        <ProgramInfoModal
          program={openProgram}
          isFavorite={selectedIds.has(openProgram.id)}
          onToggleFavorite={() => toggle(openProgram.id)}
          onClose={() => setOpenProgramId(null)}
          relatedPrograms={relatedPrograms}
          onOpenProgram={setOpenProgramId}
        />
      )}
      {introOpen && (
        <AppInfoModal
          onClose={() => {
            setIntroDismissed(true);
            setIntroManuallyOpened(false);
            markSeen();
          }}
        />
      )}
    </div>
  );
}
