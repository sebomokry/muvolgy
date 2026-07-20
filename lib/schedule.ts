import type { Location, Program } from "./types";

export function formatTime(ts: number): string {
  const d = new Date(ts);
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
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

/** Stable-partitions favorited venues to the front so they never scroll out of view. */
export function sortVenuesWithFavoritesFirst(
  venues: Location[],
  favoriteIds: Set<number>,
): Location[] {
  const favorites = venues.filter((v) => favoriteIds.has(v.id));
  const rest = venues.filter((v) => !favoriteIds.has(v.id));
  return [...favorites, ...rest];
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
