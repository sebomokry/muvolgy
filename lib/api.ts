import type { Category, FestivalData, Location, Program } from "./types";
import { LOCATION_OVERRIDES } from "./locationOverrides";
import { CATEGORY_OVERRIDES } from "./categoryOverrides";
import programsSnapshot from "@/data/programs-snapshot.json";

const API_BASE = "https://backend.muveszetekvolgye.hu/api/v1";
const PER_PAGE = 100;

type RawCategory = {
  id: number;
  name: string;
  color: string;
  order: number;
};

type RawLocation = {
  id: number;
  name: string;
  city: { name: string } | null;
};

type RawMapLocation = {
  id: number;
  address: string | null;
  location: [number, number] | null;
};

type LocationDetails = {
  address: string | null;
  coords: [number, number] | null;
};

type RawArtist = {
  id: number;
  name: string;
};

type RawProgram = {
  id: number;
  slug: string;
  name: string;
  start: string;
  end: string;
  is_all_day: boolean;
  is_invalid: boolean;
  description: string | null;
  location: RawLocation | null;
  program_categories: RawCategory[];
  artists: RawArtist[];
};

type RawProgramsPage = {
  data: RawProgram[];
  last_page: number;
};

/** Turns "YYYY-MM-DD HH:mm:ss" into a linear timestamp (ms) for duration/overlap math. */
function toTimestamp(raw: string): number {
  const [datePart, timePart] = raw.split(" ");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = (timePart ?? "00:00").split(":").map(Number);
  return Date.UTC(year, month - 1, day, hour, minute);
}

function dayKey(raw: string): string {
  return raw.split(" ")[0];
}

function normalizeProgram(
  raw: RawProgram,
  locationDetails: Map<number, LocationDetails>,
): Program | null {
  if (raw.is_invalid) return null;

  const location: Location | null = raw.location
    ? {
        id: raw.location.id,
        name: raw.location.name,
        city:
          raw.location.city?.name ??
          LOCATION_OVERRIDES[raw.location.id]?.city ??
          null,
        address:
          locationDetails.get(raw.location.id)?.address ??
          LOCATION_OVERRIDES[raw.location.id]?.address ??
          null,
        coords:
          locationDetails.get(raw.location.id)?.coords ??
          LOCATION_OVERRIDES[raw.location.id]?.coords ??
          null,
      }
    : null;

  const categories: Category[] =
    raw.program_categories.length > 0
      ? raw.program_categories.map((c) => ({
          id: c.id,
          name: c.name,
          color: c.color,
          order: c.order,
        }))
      : (CATEGORY_OVERRIDES[raw.id] ?? []);

  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.name,
    start: raw.start,
    end: raw.end,
    startTs: toTimestamp(raw.start),
    endTs: toTimestamp(raw.end),
    day: dayKey(raw.start),
    isAllDay: raw.is_all_day,
    description: raw.description,
    location,
    categories,
    artists: raw.artists.map((a) => ({ id: a.id, name: a.name })),
  };
}

async function fetchProgramsPage(page: number): Promise<RawProgramsPage> {
  const res = await fetch(
    `${API_BASE}/programs?per_page=${PER_PAGE}&page=${page}`,
    { next: { revalidate: 3600 } },
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch programs page ${page}: ${res.status}`);
  }
  return res.json();
}

/**
 * The festival's own API stops returning a program once it's elapsed —
 * confirmed live on 2026-08-02 (the festival's last day), where
 * /api/v1/programs had shrunk to ~1 page and /api/v1/dates to just that one
 * remaining day, down from the full 9-day, ~3882-program dataset that was
 * still live on 2026-07-25. `data/programs-snapshot.json` is a point-in-time
 * copy captured that day specifically to patch this gap — merged in here by
 * id, live data always wins when a program is still returned live, so this
 * only ever fills in what the API itself has since dropped. Needs no upkeep:
 * it becomes irrelevant on its own for any day the live API still knows about.
 */
function withSnapshotFallback(live: RawProgram[]): RawProgram[] {
  const liveIds = new Set(live.map((p) => p.id));
  const snapshotOnly = (programsSnapshot as RawProgram[]).filter(
    (p) => !liveIds.has(p.id),
  );
  return [...live, ...snapshotOnly];
}

async function fetchAllRawPrograms(): Promise<RawProgram[]> {
  const first = await fetchProgramsPage(1);
  const remainingPages = Array.from(
    { length: first.last_page - 1 },
    (_, i) => i + 2,
  );
  const rest = await Promise.all(remainingPages.map(fetchProgramsPage));
  const live = [first, ...rest].flatMap((page) => page.data);
  return withSnapshotFallback(live);
}

async function fetchDates(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/dates`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch dates: ${res.status}`);
  }
  const json: { dates: string[] } = await res.json();
  return json.dates;
}

/** Address/coordinates live on the map endpoint, not on /programs — merged in by location id. */
async function fetchLocationDetails(): Promise<Map<number, LocationDetails>> {
  const res = await fetch(`${API_BASE}/map`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch map: ${res.status}`);
  }
  const json: { data: { locations: RawMapLocation[] } } = await res.json();
  return new Map(
    json.data.locations.map((loc) => [
      loc.id,
      { address: loc.address, coords: loc.location },
    ]),
  );
}

export async function getFestivalData(): Promise<FestivalData> {
  const [rawPrograms, days, locationDetails] = await Promise.all([
    fetchAllRawPrograms(),
    fetchDates(),
    fetchLocationDetails(),
  ]);

  const programs = rawPrograms
    .map((raw) => normalizeProgram(raw, locationDetails))
    .filter((p): p is Program => p !== null)
    .sort((a, b) => a.startTs - b.startTs);

  const categoryById = new Map<number, Category>();
  const locationById = new Map<number, Location>();
  for (const program of programs) {
    for (const category of program.categories) {
      categoryById.set(category.id, category);
    }
    if (program.location) {
      locationById.set(program.location.id, program.location);
    }
  }

  // /api/v1/dates alone can no longer be trusted to list every day that
  // actually has a program (see withSnapshotFallback) — union it with the
  // days the merged program list itself spans, so a day never drops out of
  // DateTabs just because the live endpoint stopped mentioning it.
  const allDays = new Set([...days, ...programs.map((p) => p.day)]);

  return {
    days: [...allDays].sort(),
    programs,
    categories: [...categoryById.values()].sort((a, b) => a.order - b.order),
    locations: [...locationById.values()].sort((a, b) =>
      a.name.localeCompare(b.name, "hu"),
    ),
  };
}
