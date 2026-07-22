# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

A personal, unofficial schedule tool for the Művészetek Völgye festival. The
official site's program search is hard to use for spotting which concerts at
different venues overlap in time; this app fetches the same public festival
data and renders it as a time × venue grid so overlaps are visible at a glance,
plus lets the user star venues and pick programs to build their own itinerary.

No backend of our own — it's a static/ISR Next.js app deployed to Vercel that
reads directly from the festival's own public API at build/request time.

## Commands

```
npm run dev     # dev server, http://localhost:3000
npm run build   # production build (also type-checks)
npm run lint    # eslint
```

There is no test suite. To verify UI changes, run the dev server and drive it
with Playwright (`npm install --no-save playwright-core`, not a project
dependency — install/remove it per verification session). Two environment
quirks specific to this sandbox:
- `next build`'s static-page-generation workers need broader network access
  than the default sandboxed Bash tool grants — run `npm run build` with
  `dangerouslyDisableSandbox: true` or the external `fetch` calls in
  `lib/api.ts` time out.
- Playwright's own module resolution requires the driver script to live
  inside the project directory (not `/tmp`/scratchpad) or `playwright-core`
  won't resolve.

## Architecture

**Data flow**: `app/page.tsx` (server component) calls `getFestivalData()` in
`lib/api.ts`, which paginates the festival's public API
(`backend.muveszetekvolgye.hu/api/v1/programs`, 100/page) to pull all ~4300
programs, merges in address/coordinates from the separate `/api/v1/map`
endpoint, and normalizes everything into the `Program`/`Location`/`Category`
shapes in `lib/types.ts`. Every `fetch` uses `next: { revalidate: 3600 }`
(Next's pre-Cache-Components model — `cacheComponents` is *not* enabled in
`next.config.ts`).

Only ~44% of venues have precise real-world GPS `location` data from
`/api/v1/map` — the rest fall back to a text search in `lib/maps.ts`'s
`mapsLink()` (venue name + city, handed to Google's own search/geocoding,
which resolves surprisingly well for venues with an independently
real-world-searchable name like "Közlekedési Múzeum", less so for
festival-only invented names). Every one of the 104 venues *does* have
`marker_x`/`marker_y` — a pixel position on the festival's own
hand-illustrated map image — but that's deliberately never used as a
stand-in for GPS: fitting a linear transform from the 46 venues that have
both pixel position and real GPS gives a median error of ~600m and a max of
~2.5km against the other 58, i.e. the illustrated map isn't drawn to real
geographic scale, so an estimated coordinate would be actively misleading
rather than just imprecise. `components/VenueDetails.tsx` shows the raw
coordinates as text when present, and a light "maybe Google will find it
anyway" fallback line when not, rather than implying anything authoritative.

Of the 49 venues that actually host a program, 24 had neither address nor
coords from `/api/v1/map` (always both-or-neither, never just one), plus
one venue (Visa KözTér) missing from that endpoint entirely despite hosting
120 programs. `lib/locationOverrides.ts` fills these in — but only for
venues with a genuinely confirmed source (either the user's own on-site
knowledge, or an independently citable web source for the handful of
venues that turned out to be real, permanent, publicly-documented
buildings, e.g. MűvészVölgy Kúria), matching the same principle as the
`marker_x`/`marker_y` rejection above: an unverified guess would be worse
than the existing honest "no exact address" fallback. `normalizeProgram`
in `lib/api.ts` reads `LOCATION_OVERRIDES[id]` as the last fallback step
for `city`/`address`/`coords` independently — only filling in whichever of
the three the live API still doesn't provide, so if the festival's own
data ever catches up for a venue, it wins automatically with no code
change needed. As of this writing, coverage is effectively complete except
for coordinates on Visa KözTér — extend the file the same way (venue id →
`{ city?, address?, coords? }`, id found via
`curl -s "$API/map" | grep -o '"id":[0-9]*,"name":"[^"]*<venue name>[^"]*"'`)
if more verified data turns up later; don't add an entry without a
citable source.

Programs also carry an `artists: { id, name
}[]` field (from the API's `artists` relation — the `id` is kept
specifically so the same performer can be matched across different
programs/days, not just by name). `lib/schedule.ts`'s
`extraArtists(programName, artists)` filters out artist names already
implied by the program title (normalized, punctuation/case-insensitive
substring check) so e.g. "ESTI KORNÉL" + artist "Esti Kornél" isn't shown
twice, while genuinely different names (title "Buli DJ - dj Snoopy", artist
"Momentán Társulat") still show; `otherProgramsByArtists(program,
allPrograms)` uses the artist `id`s to find every other program (any
day/venue) featuring the same performer(s), regardless of the currently
active filters — this powers the "more appearances by this artist" section
in the program info modal. The fully-loaded dataset is passed as a prop
into `components/FestivalApp.tsx`, a single client component that owns all
interactive state (selected day, active categories, active settlements, view
tab) and filters/groups the in-memory dataset — there's no per-filter
refetching. Category filter (`CategoryFilter.tsx`) and settlement/town filter
(`SettlementFilter.tsx`, the festival spans only 3 villages) are independent
AND-combined filters over the same program list. Programs with zero
categories (~6% of all programs, e.g. "Chill Zone", "Visa Taxi") are folded
into the same `activeCategoryIds: Set<number>` via a sentinel
`UNCATEGORIZED_ID = -1` (guaranteed not to collide with the API's own,
always-positive category ids): `FestivalApp.tsx` builds
`categoriesWithUncategorized` by appending a synthetic `{ id:
UNCATEGORIZED_ID, name: "Kategória nélküli" }` entry to `data.categories`
before handing the list to `CategoryFilter`, so it renders as an ordinary
chip alongside the real categories rather than a separate toggle outside
the filter row. This was a deliberate fix — an earlier version used a
standalone `showUncategorized` boolean and its own button next to
`CategoryFilter`, which meant the filter's "mind"/"egyik sem" (all/none)
buttons silently skipped it. Folding it into the same set means
`CategoryFilter.tsx` itself needed no changes at all (it already handles an
arbitrary `{id, name}` list generically); the synthetic name deliberately
isn't in `lib/categoryColors.ts`'s `CATEGORY_COLORS` map, so it falls back
to the same neutral `FALLBACK_COLOR` already used for zero-category program
blocks (`categoryColor(program.categories[0]?.name ?? "")` in
`ScheduleGrid.tsx`) — one shared neutral color for "no category" everywhere,
not a second one-off. Default state is unaffected: `defaultCategoryIds`
only ever matches the real "Könnyűzene" category, so the sentinel starts
unselected.

A separate "Csak Kedvenceim" chip sits at the end of the same filter row
(`CategoryFilter.tsx`'s optional `extraChip` prop) but is deliberately
**not** folded into `activeCategoryIds` the way the uncategorized entry is:
it's a cross-cutting override (only show programs already in
`selectedIds`), not another OR-able category, so treating it as a peer set
member would break "mind"'s meaning ("mind" = every category active, which
would then also flip on an override that hides almost everything). It's its
own `onlyFavorites` boolean in `FestivalApp.tsx`, wired in ahead of the
category branch in the `visiblePrograms` filter — when active, category
matching (and the `UNCATEGORIZED_ID` branch) is bypassed entirely and only
`selectedIds.has(p.id)` decides visibility, while the settlement filter
still applies via AND (it's an orthogonal, location-based axis, not a
category one). While the override is active, `CategoryFilter` visually
`disabled`s and dims (`opacity-40`) the real category chips and the "mind"/
"egyik sem" links, since they have no effect until it's turned back off —
turning it off doesn't lose the prior category selection, it was never
touched. The chip itself uses `--pin` (gold) rather than a category color,
matching the same "has a saved program" visual language as the pin-tier
half-star in `ScheduleGrid.tsx` and the "Kedvenceim" tab.

**Grid rendering** (`components/ScheduleGrid.tsx`): rows = venues (sticky
left column, narrow/near-square, venue name wraps 2-4 lines rather than
truncating), columns = a continuous horizontal time axis (sticky top header)
— *not* a CSS grid. Each program is absolutely positioned (`left`/`width` in
pixels from a pixel-per-minute constant, `PX_PER_MIN`) within its venue's
row, because programs have irregular durations a column-based grid can't
represent cleanly. **Block width always equals the program's real duration**
— `MIN_BLOCK_WIDTH` is a 6px floor purely against zero/negative-duration bad
data, not a readability padding: it used to be 130px "so short programs
still show text," but that silently stretched blocks past their real end
time (a 60-min show could visually look ~90 min long) — accuracy of the
overlap picture matters more here than always-fitting text, so short blocks
now just truncate harder (title tooltip + click-through modal cover the
rest). When multiple programs in the same venue overlap in time, a greedy
interval-graph lane assignment lays them out stacked in sub-rows (`top`/
`height` by lane index) instead of overlapping; a row's height grows with its
peak concurrency (some venues like "Főtér" have 25+ simultaneous
market-stall programs) so text stays readable instead of being squeezed.
Hour gridlines are deliberately rendered *after* (on top of, `pointer-events-
none`) the program blocks — drawing them first let opaque blocks paint over
them, hiding the line wherever a block crossed it.

Each block's three text lines are **headline / subtitle / time**, sized 13px
bold / 9px / 9px respectively. Which of {`program.name`, the deduped artist
list} is the headline depends on `lib/schedule.ts`'s `isMusicProgram`: for
music-category programs the *title* is the headline (festival data
sometimes tags only individual band members as `artists`, not the band
itself — e.g. "Zækar" has artists `["Ambrus Andris", ...]` with no "Zækar"
artist record — so the title is the only reliably-correct act name), with
any distinct artist names as the subtitle; non-music programs keep the
named speaker/artist as the headline and the title as the subtitle (e.g. a
themed talk where who's speaking matters more than that day's title). The
9px time size is not arbitrary — it's the largest size that still fits
"HH:MM–HH:MM" inside an 84px-wide block, which is what a plain 60-minute
program renders as (`60 * PX_PER_MIN`); re-measure against that exact width
(`scrollWidth` vs `clientWidth`) before changing it, since 1-hour shows are
the single most common duration.

> **Flexbox gotcha that already bit this layout twice**: the outer scroll
> container is `flex flex-col overflow-auto`. Every direct child (the sticky
> header row, each venue row) needs both `shrink-0` (otherwise flexbox
> compresses rows to fit the container instead of overflowing+scrolling —
> collapsed the header to ~1px) and `w-max` (otherwise a child with no
> explicit width stretches to the *container's* width instead of its actual
> content width — truncated row-separator borders at the viewport edge when
> scrolled right). If you add new direct children to that scroll container,
> they need both classes too.

Each venue row's timeline container (the sibling of the sticky venue-header
cell) has `overflow-hidden`: a selected/conflicting program's `box-shadow`
ring extends a couple pixels past the block's own edges, and without a clip
boundary that ring bled visually onto the sticky venue-header column
whenever the row scrolled horizontally underneath it (very visible on
mobile, where horizontally panning the grid is the normal way to see later
hours). `overflow-hidden` on that container clips the ring at the timeline's
own edge instead, so it can never render over the sticky column regardless
of scroll position.

**Info modals, not direct toggling**: clicking a program block (grid or the
"Kedvenceim" list) does *not* directly select/deselect it — it opens
`ProgramInfoModal` (name, artists, venue + `VenueDetails`, and a star button
that's the *only* place favoriting actually happens). Venue headers in
`ScheduleGrid` work the same way: the whole header cell is a single button
that opens `VenueInfoModal` (the ☆/★ glyph inside it is now just a static
indicator, not a separate click target) — this was a deliberate change from
an earlier version with two adjacent small buttons (star + name), which was
prone to mis-taps in the ~96px-wide header cell; `VenueInfoModal` itself
gained the same "star toggles inside the modal" favorite button
`ProgramInfoModal` already had. Both modals share the venue name/city/
address/"Megnyitás térképen" block via `components/VenueDetails.tsx` rather
than duplicating it. Clicking one of the artist's other appearances inside the
modal calls the same open-handler with a different program id — the modal
re-renders in place showing that program instead of stacking/navigating to a
new screen. Because both `ScheduleGrid` and `SelectedPanel` need this same
modal fed from the *full*, unfiltered `data.programs` (an artist's other
show might be outside today's filters), the open/close state and the modal
itself live in `FestivalApp.tsx`, not in either child — they just call an
`onOpenProgram(id)` prop passed down.

`VenueInfoModal` and `ProgramInfoModal`'s favorite buttons look identical
but toggle two unrelated stores (`favoriteVenues` vs. `selectedPrograms`),
so their copy is deliberately worded to name what each one actually does
rather than sharing generic "kedvenc" text: the venue modal says
"Hozzáadás a kedvenc helyszínekhez" / "Eltávolítás a kedvenc helyszínek
közül", the program modal says "Hozzáadás a Kedvenceimhez" / "Eltávolítás a
Kedvenceim közül" — the latter names the destination tab directly (see
below) so the button says exactly what it does. Both buttons also switch
from `--accent` (green) to `--danger` (orange) styling once `isFavorite` is
true: the button *removes* at that point, and a removal action shouldn't
look identical to the "add" state it started from.

**Artists view** (`components/ArtistsView.tsx`, third tab alongside
Programtábla/Kedvenceim): a searchable, alphabetical directory built by
`lib/schedule.ts`'s `allArtists(programs)`, which is not simply "one row per
API artist" — the source data is inconsistent about whether a band/act gets
its own artist record or only its individual members do (e.g. the concert
"Bala Marea" has artists `["Dely Viktória", "Horváth Máté", ...]` but no
"Bala Marea" artist record at all). For music-category programs where the
title doesn't match any of its tagged artists, `allArtists` adds the
program's own title as a synthetic stand-in entry (keyed `title:<name>`
instead of `artist:<id>`) so the act is still findable by its own name — a
known limitation is that such entries' "other appearances" (via
`otherProgramsByArtists`) match by the individual members' ids, not a
stable band id, since none exists. Each entry also carries the `categoryColor`/
`categoryName` of its earliest program's first category (same
`lib/categoryColors.ts` palette used elsewhere) shown as a small dot per row.
Clicking any entry opens the same shared `ProgramInfoModal` via
`onOpenProgram`, targeted at that artist's earliest program.

**Persistence**: selected programs and starred venues are both backed by the
same localStorage-synced store factory, `hooks/idSetStore.ts`
(`createIdSetStore(key)`), built on `useSyncExternalStore` rather than
`useState` + `useEffect` — this was a deliberate choice after
`eslint-plugin-react-hooks`'s `set-state-in-effect` rule flagged the more
obvious effect-based approach; it also sidesteps SSR/hydration mismatches
since `getServerSnapshot` always returns an empty set.

**Derived scheduling logic** lives in `lib/schedule.ts` as pure functions:
grouping programs by day, splitting all-day vs. timed programs, and
overlap/conflict detection (`overlaps`, `conflictingIds`) used both for the
grid's conflict highlighting and the "Kedvenceim" (saved programs) tab.
`sortVenuesWithFavoritesFirst` pins venue rows in three tiers, not two:
starred venues, then *unstarred* venues that merely host a saved
(`selectedIds`) program that day (so a favorited concert never gets lost
scrolling through an alphabetical venue list just because you never starred
its venue), then everything else — each tier alphabetical internally. The
middle tier is recomputed per day in `FestivalApp.tsx` from the already
day/filter-scoped `timed` list, so it naturally only pins on the day the
saved concert actually occurs.

**Visual identity**: category colors are a hand-picked palette in
`lib/categoryColors.ts` that deliberately overrides the festival API's own
`color` field per category — the API's colors are pale pastels that don't
stay visually distinct in a dense grid; program blocks tint their
background with the category color at 25% alpha (`${color}40` as a hex
alpha suffix) rather than the ~8% (`${color}14`) used earlier, since the
lighter tint didn't separate categories clearly enough at a glance. Design
tokens (`--paper: #f7f7ff`, `--ink: #023047`, `--accent: #3f826d`,
`--pin: #ffb703`, `--danger: #fb8500`, plus derived `-soft` tint variants
mixed toward `--paper`) live in `app/globals.css` — these are the user's own
exact hex choices, not sampled/derived, so don't adjust the 5 base values
without asking; the three-typeface system (Space Grotesk / IBM Plex Sans /
IBM Plex Mono) is set up in `app/layout.tsx` via `next/font/google` — Plex
Mono is used specifically for times/dates for a "timetable board" feel.

The venue header cell in `ScheduleGrid.tsx` deliberately does **not** tint
its background for starred or pin-tier venues — it always shows the plain
settlement color (`settlement.soft`), the same as any other venue. Favorite/
pin state is carried *only* by the ☆/★ glyph: empty outline (☆) for a
plain venue, a solid ink-colored ★ for a starred venue, and — for the
"unstarred venue that merely hosts a saved concert today" pin tier — a
vertically-split half star (a `★` clipped to its left 50% via
`clipPath: inset(0 50% 0 0)`, colored `--pin`, layered over the base ☆
outline) rather than a full star or a background tint. This replaced an
earlier version where the pin tier got a solid `--pin-soft` background
(and, before that, starred venues got an `--accent-soft` background) — both
were dropped because a colored header background competed visually with
the always-on settlement-color stripe (see below) for the same cell; the
glyph is now the only channel for favorite/pin state, so `--pin-soft` is
currently unused (kept defined in `globals.css` for palette symmetry, not
referenced by any component).

Settlement colors are a separate palette, `lib/settlementColors.ts`
(`settlementColor(city)` → `{ solid, soft }`), for the festival's 3 villages
— exact hex values the user chose directly (not sampled/derived), so don't
adjust them without asking. Used in three places: `SettlementFilter.tsx`
chips (same active/inactive chip pattern as `CategoryFilter`), the venue
header's `border-t-[3px]` stripe in `ScheduleGrid.tsx` (always visible,
independent of favorite/pin state — same layering idea as category colors
on program blocks), and the city name inside `VenueDetails.tsx` (a filled
pill instead of plain text). Keep the settlement stripe as a separate,
always-on visual channel rather than folding it into the cell's background
— that's why it's a top border rather than competing for the cell's fill
color, which is exactly the reasoning that later also pushed favorite/pin
state off the background and onto the star glyph.

**Mobile**: the category filter row collapses behind a toggle below the `sm`
breakpoint (state in `FestivalApp.tsx`) to leave more vertical space for the
grid; above `sm` it's always shown regardless of that state.
