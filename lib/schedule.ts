import type { Location, Program } from "./types";
import { categoryColor } from "./categoryColors";

export function formatTime(ts: number): string {
  const d = new Date(ts);
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

/**
 * Program timestamps store the festival's local wall-clock time reinterpreted
 * as UTC (see toTimestamp in lib/api.ts) so formatTime's getUTCHours reads
 * back the correct local hour. To compare "now" against them, the visitor's
 * own local wall-clock components need the same reinterpretation — a raw
 * epoch ms would be off by the local UTC offset.
 */
export function toScheduleTimestamp(epochMs: number): number {
  const d = new Date(epochMs);
  return Date.UTC(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    d.getHours(),
    d.getMinutes(),
  );
}

export function formatDay(day: string): string {
  const [, month, date] = day.split("-");
  const months = [
    "jan",
    "feb",
    "márc",
    "ápr",
    "máj",
    "jún",
    "júl",
    "aug",
    "szept",
    "okt",
    "nov",
    "dec",
  ];
  return `${months[Number(month) - 1]}. ${Number(date)}.`;
}

const WEEKDAYS = [
  "vasárnap",
  "hétfő",
  "kedd",
  "szerda",
  "csütörtök",
  "péntek",
  "szombat",
];

export function formatWeekday(day: string): string {
  const [year, month, date] = day.split("-").map(Number);
  return WEEKDAYS[new Date(Date.UTC(year, month - 1, date)).getUTCDay()];
}

// Hungarian digraphs (sz, cs) count as one letter, so "szerda"/"szombat" ->
// "Sz" and "csütörtök" -> "Cs", not just their first character.
const WEEKDAY_INITIALS = ["V", "H", "K", "Sz", "Cs", "P", "Sz"];

export function formatWeekdayInitial(day: string): string {
  const [year, month, date] = day.split("-").map(Number);
  return WEEKDAY_INITIALS[
    new Date(Date.UTC(year, month - 1, date)).getUTCDay()
  ];
}

export function programsForDay(programs: Program[], day: string): Program[] {
  return programs.filter((p) => p.day === day);
}

export function splitAllDay(programs: Program[]): {
  timed: Program[];
  allDay: Program[];
} {
  const timed: Program[] = [];
  const allDay: Program[] = [];
  for (const p of programs) {
    (p.isAllDay ? allDay : timed).push(p);
  }
  return { timed, allDay };
}

export function venuesForPrograms(programs: Program[]): Location[] {
  const byId = new Map<number, Location>();
  for (const p of programs) {
    if (p.location) byId.set(p.location.id, p.location);
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name, "hu"));
}

export function allSettlements(locations: Location[]): string[] {
  const cities = new Set(
    locations.map((l) => l.city).filter((c): c is string => c !== null),
  );
  return [...cities].sort((a, b) => a.localeCompare(b, "hu"));
}

/**
 * Stable-partitions venues into three tiers so they never scroll out of view:
 * starred venues first, then unstarred venues that happen to host a saved
 * program today, then everything else — each tier alphabetical internally.
 */
export function sortVenuesWithFavoritesFirst(
  venues: Location[],
  favoriteIds: Set<number>,
  venuesWithSelectedProgram: Set<number> = new Set(),
): Location[] {
  const favorites = venues.filter((v) => favoriteIds.has(v.id));
  const withSelectedProgram = venues.filter(
    (v) => !favoriteIds.has(v.id) && venuesWithSelectedProgram.has(v.id),
  );
  const rest = venues.filter(
    (v) => !favoriteIds.has(v.id) && !venuesWithSelectedProgram.has(v.id),
  );
  return [...favorites, ...withSelectedProgram, ...rest];
}

/** Rounds the visible time range out to whole hours so the grid starts/ends cleanly. */
export function timeRangeFor(programs: Program[]): {
  startTs: number;
  endTs: number;
} {
  if (programs.length === 0) {
    return { startTs: 0, endTs: 0 };
  }
  const hour = 60 * 60 * 1000;
  const minStart = Math.min(...programs.map((p) => p.startTs));
  const maxEnd = Math.max(...programs.map((p) => p.endTs));
  return {
    startTs: Math.floor(minStart / hour) * hour,
    endTs: Math.ceil(maxEnd / hour) * hour,
  };
}

function normalizeForComparison(s: string): string {
  return s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
}

/** Drops artist names already implied by the program title (e.g. "ESTI KORNÉL" / "Esti Kornél") so they aren't shown twice. */
export function extraArtists(
  programName: string,
  artists: Program["artists"],
): Program["artists"] {
  const normalizedName = normalizeForComparison(programName);
  return artists.filter(
    (artist) => !normalizedName.includes(normalizeForComparison(artist.name)),
  );
}

/** Every other program (any day/venue) sharing at least one artist with this one, earliest first. */
export function otherProgramsByArtists(
  program: Program,
  allPrograms: Program[],
): Program[] {
  const artistIds = new Set(program.artists.map((a) => a.id));
  if (artistIds.size === 0) return [];

  const related: Program[] = [];
  for (const p of allPrograms) {
    if (p.id === program.id) continue;
    if (p.artists.some((a) => artistIds.has(a.id))) {
      related.push(p);
    }
  }
  return related.sort((a, b) => a.startTs - b.startTs);
}

export type ArtistSummary = {
  id: string;
  name: string;
  firstProgramId: number;
  categoryColor: string;
  categoryName: string;
};

const MUSIC_CATEGORIES = new Set([
  "Könnyűzene",
  "Jazz",
  "Komolyzene",
  "Népzene, Világzene",
]);

/** True if any of the program's categories is a music category — the title is then treated as the act's own name. */
export function isMusicProgram(categories: Program["categories"]): boolean {
  return categories.some((c) => MUSIC_CATEGORIES.has(c.name));
}

/**
 * Every distinct artist across all programs, alphabetical, each pointing at
 * their earliest appearance. Also adds the program's own title as a
 * stand-in "artist" for music-category shows where the band itself was
 * never tagged as an artist in the source data — only its individual
 * members were (e.g. "Bala Marea" has artists ["Dely Viktória", "Horváth
 * Máté", ...] but no "Bala Marea" artist record) — otherwise such acts
 * would never be findable by their own name.
 */
export function allArtists(programs: Program[]): ArtistSummary[] {
  const byKey = new Map<
    string,
    {
      name: string;
      startTs: number;
      programId: number;
      categoryColor: string;
      categoryName: string;
    }
  >();

  const upsert = (key: string, name: string, p: Program) => {
    const existing = byKey.get(key);
    if (!existing || p.startTs < existing.startTs) {
      const category = p.categories[0];
      byKey.set(key, {
        name,
        startTs: p.startTs,
        programId: p.id,
        categoryColor: categoryColor(category?.name ?? ""),
        categoryName: category?.name ?? "Egyéb",
      });
    }
  };

  for (const p of programs) {
    for (const artist of p.artists) {
      upsert(`artist:${artist.id}`, artist.name, p);
    }

    if (isMusicProgram(p.categories)) {
      const normalizedTitle = normalizeForComparison(p.name);
      const titleRepresented = p.artists.some((a) =>
        normalizedTitle.includes(normalizeForComparison(a.name)),
      );
      if (!titleRepresented) {
        upsert(`title:${normalizedTitle}`, p.name, p);
      }
    }
  }

  return [...byKey.entries()]
    .map(([id, v]) => ({
      id,
      name: v.name,
      firstProgramId: v.programId,
      categoryColor: v.categoryColor,
      categoryName: v.categoryName,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "hu"));
}

export function overlaps(a: Program, b: Program): boolean {
  return a.id !== b.id && a.startTs < b.endTs && b.startTs < a.endTs;
}

export function conflictingIds(
  selected: Program[],
): Set<number> {
  const conflicts = new Set<number>();
  for (let i = 0; i < selected.length; i++) {
    for (let j = i + 1; j < selected.length; j++) {
      if (overlaps(selected[i], selected[j])) {
        conflicts.add(selected[i].id);
        conflicts.add(selected[j].id);
      }
    }
  }
  return conflicts;
}
