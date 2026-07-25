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
- The service worker (see below) often doesn't activate consistently under
  `next dev`; verify offline/PWA behavior against `npm run build` +
  `npm start` instead of the dev server.

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
A small `⧉`/`✓` copy-to-clipboard button (local `CopyButton`, its own
`useState` for the 1.5s "copied" flip — a plain in-place UI toggle, not
persisted state, so it doesn't need the `useSyncExternalStore` treatment
other stores in this app get) sits next to both the address and the
coordinates line, copying the exact displayed address text or the raw
(non-rounded) coordinate pair respectively; it's only rendered when there's
a real value to copy, not next to the "no address" fallback line.

`VenueDetails.tsx` also links out to the festival's own official page for
that venue (`muveszetekvolgye.hu/location/{id}`, `border-ink` outline
button, below the "Megnyitás térképen" accent button) — real detail pages
the official site already serves, just not fetched/scraped, purely linked.
This is gated by an optional `showOfficialLink` prop (default `true`)
because `ProgramInfoModal.tsx` renders its own separate
`muveszetekvolgye.hu/program/{id}` link and deliberately passes
`showOfficialLink={false}` to the shared `VenueDetails` instance it embeds
— otherwise the program modal would show both a venue-page link and a
program-page link stacked, when only the program one is relevant there;
`VenueInfoModal.tsx` (which has no program of its own) keeps the venue
link at its default `true`.

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

The same gap-filling pattern exists for categories: `lib/categoryOverrides.ts`
holds a `Record<programId, Category[]>` for programs the API tags with zero
`program_categories` despite being clearly identifiable live music (found
so far by the user recognizing an act by name, not by any automated
detection) — e.g. "STREET SIXTEEN" and "Parno Graszt" (program ids `3393`/
`3392`), both hard-coded to the exact real "Könnyűzene" category object
(`id: 1, color: "#feb737", order: 300`, taken directly from other programs'
real API data, not invented). `normalizeProgram` in `lib/api.ts` only
consults `CATEGORY_OVERRIDES[raw.id]` when `raw.program_categories` is
empty, so — same as the location overrides — an eventual upstream fix
supersedes it with no code change. Find a program's id the same way as a
venue's, against `/api/v1/programs` instead of `/map`.

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

A "Csak a Kedvenceim" chip sits in `FestivalApp.tsx`, next to the
mobile-only "Kategóriák" collapse toggle (both above `CategoryFilter`, not
inside it) but is deliberately **not** folded into `activeCategoryIds` the
way the uncategorized entry is: it's a cross-cutting override (only show
programs already in `selectedIds`), not another OR-able category, so
treating it as a peer set member would break "mind"'s meaning ("mind" =
every category active, which would then also flip on an override that
hides almost everything). It's its own `onlyFavorites` boolean in
`FestivalApp.tsx`, wired in ahead of the category branch in the
`visiblePrograms` filter — when active, category matching (and the
`UNCATEGORIZED_ID` branch) is bypassed entirely and only
`selectedIds.has(p.id)` decides visibility, while the settlement filter
still applies via AND (it's an orthogonal, location-based axis, not a
category one). While the override is active, `CategoryFilter` takes a
`disabled` prop and visually dims (`opacity-40`) the real category chips
and the "mind"/"egyik sem" links, since they have no effect until it's
turned back off — turning it off doesn't lose the prior category
selection, it was never touched. The chip uses its own token, `--saved`
(`app/globals.css`) — not `--pin` (gold), which reads as visually identical
to Taliándörögd's settlement color (`#ffb636` vs. `#ffb703`, see below) once
both are on screen at once; `--saved` is a cobalt blue chosen specifically
to sit outside every other color family already in use (accent green,
danger, pin/Taliándörögd gold, Kapolcs teal, Vigántpetend mauve).

`SettlementFilter.tsx` intentionally has no "mind"/"egyik sem" bulk actions
— with only 3 settlements, toggling them individually is already as fast;
`CategoryFilter.tsx` keeps its own "mind"/"egyik sem" since that list is
much longer. The mobile-only "Kategóriák (N)" toggle button
(`FestivalApp.tsx`) is styled as a pill (`rounded-full border`) like every
other filter chip so it visually reads as clickable, and turns solid
`bg-ink text-paper` while expanded (`categoriesOpen`) — the same
active-state pattern as the Programtábla/Kedvenceim/Előadók view tabs — so
its open/closed state is legible at a glance, not just from the ▸/▾ glyph.

Its show/hide breakpoint is deliberately **not** plain Tailwind `sm:`
(width-only, `min-width: 640px`): a landscape phone crosses 640px in width
while still being very short vertically (e.g. ~390-430px), so a
width-only check would misclassify it as "desktop" and force the full,
always-expanded category list into a viewport with no room for it. Both
the toggle button and the category-list wrapper instead use the same
compound arbitrary variant, `[@media(min-width:640px)_and_(min-height:500px)]:`
— comfortably separating actual landscape phones from tablets/desktop
(both wide *and* tall) — and must always change together (each has a code
comment pointing at the other). As a second-line defense, the whole filter
block (`DateTabs`/`SettlementFilter`/toggle row/category list) is now
`max-h-[60vh] overflow-y-auto` on its own, so if its content still
outgrows the available height for any reason, it scrolls internally
instead of shoving `ScheduleGrid` off-screen with no way back (the outer
`<body>` is `overflow-hidden` by design — see below).

`SettlementFilter` and the "Kategóriák"/"Csak a Kedvenceim" buttons are
siblings inside one `flex flex-wrap` row (not two separate rows) —
deliberately not gated by a breakpoint at all. Whether they end up on one
line or two falls out of ordinary flex-wrap width math: on a landscape
phone (wide) they merge onto a single row, saving the vertical space that
matters there; on a portrait phone (narrow) they naturally wrap onto two,
matching the original two-row layout. This also merges them on desktop
(also wide), which wasn't the original ask but reads fine, since
"Kategóriák" is hidden there anyway (compound breakpoint above) and only
"Csak a Kedvenceim" ends up sharing the row.

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

A **"now" indicator** — a thin `--now` (red, `#e63946`) vertical line — is
drawn the same way, once in the sticky header and once per venue row
(rendered last, so it's the topmost line), rather than as a single element
spanning the whole grid: row heights vary with lane count, so one
absolutely-positioned element spanning multiple flex children would need a
separately-tracked total height; per-row rendering reuses the exact same
`left` math as the hourMarks gridlines and needs no extra bookkeeping.
`hooks/useNow.ts` supplies the current time via `useSyncExternalStore`
(the same pattern as `idSetStore.ts`, but ticking off a `setInterval`
instead of `localStorage`) — its `getSnapshot` deliberately rounds to the
minute rather than returning a raw `Date.now()`, because
`useSyncExternalStore` re-invokes `getSnapshot` on every render to check
for tearing, and a value that changes on literally every call would loop.
The line only renders when "now" falls inside the *currently displayed*
day's own `rangeStartTs`/`rangeEndTs` (already computed from that day's
visible programs) — so it naturally disappears on any other day, and
naturally doesn't reach outside the hours the grid actually spans that
day, with no separate "is this today" flag needed.

Comparing "now" against program timestamps needs the same "pretend UTC"
reinterpretation `lib/api.ts`'s `toTimestamp` applies when parsing festival
data (see below) — program timestamps store the festival's local
wall-clock time as if it were UTC, so `lib/schedule.ts`'s
`toScheduleTimestamp(epochMs)` takes the visitor's own device's *local*
calendar components (`getFullYear`/`getHours`/etc., not the UTC variants)
and re-encodes them the same way via `Date.UTC(...)`. This is correct as
long as the visitor's device is set to Hungarian time, which holds for
anyone actually at the festival — the target audience for this feature.
The indicator (like the whole app) needs no network access to work: it's
the device's own clock, so it renders correctly even fully offline (see
PWA section below), verified via the same second-visit-then-offline
Playwright/CDP method already used for the service worker.

The sticky header's hour labels (e.g. "15:00") are centered on their
gridline (`-translate-x-1/2`) for every hour *except* the first and last:
the first is left-aligned (no translate) and the last is right-aligned
(`-translate-x-full`), so their text grows away from the timeline's own
edges instead of across them. Centering the very first label put its left
half at negative x, directly under the opaque sticky venue-header column
(z-10) — invisible, not just visually crowded — and centering the last
put its right half past the timeline's own declared width. Only the two
extremes need this; every label in between has room on both sides.

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
since `getServerSnapshot` always returns an empty set. `hooks/useHasSeenIntro.ts`
follows the exact same shape (module-level state, `subscribe`/`getSnapshot`/
`getServerSnapshot`, localStorage key `mv-seen-intro`) but as a one-off hook
rather than going through `createIdSetStore` — it persists a single boolean,
not an id set, so reusing that factory would've meant forcing a
`Set<number>` shape onto a single flag for no benefit.

**App info modal** (`components/AppInfoModal.tsx`, `max-h-[85vh]
overflow-y-auto` on its inner box so it stays reachable — including its
bottom "Értem" button — on short viewports like a landscape phone): opened
from a small dark circular ⓘ button (`bg-ink`, deliberately just the
button itself and not the whole sticky corner cell behind it — the cell
stays `bg-paper` like the rest of the header) in the schedule grid's
top-left corner cell (`components/ScheduleGrid.tsx`), the one cell that's
otherwise empty (sits above the venue column, to the left of the time
axis). Auto-opens on a visitor's first-ever visit via `useHasSeenIntro`,
but the auto-open logic needs *no* `useEffect`: `FestivalApp.tsx` derives
visibility for render as `introManuallyOpened || (!hasSeenIntro &&
!introDismissed)`. `markSeen()` (a plain store write, called from the
modal's `onClose` handler, not from an effect) is what prevents it from
reappearing on the next visit; the ⓘ button independently sets
`introManuallyOpened`, so it stays available as a manual entry point
regardless of `hasSeenIntro`.

`useHasSeenIntro.ts`'s `getServerSnapshot()` deliberately returns `true`
("already seen"), not `false` — this bit the opposite way round from every
other `getServerSnapshot` in this codebase, worth remembering if touched
again. `getServerSnapshot`'s value isn't just an SSR-only concern: it's
also what the client's first hydration pass renders, before
`localStorage` can be read at all (that only happens once `getSnapshot`
runs post-mount). For `hooks/idSetStore.ts`, defaulting to "empty set" is
visually neutral either way, so a `false`-ish default costs nothing. Here
it isn't neutral: a `false` default means the intro modal is present in
the raw server-rendered HTML for *every* visitor, including returning
ones, and only disappears once hydration corrects it — a visible flash on
every single load, not just the first. Defaulting to `true` inverts who
pays for that gap: returning visitors (the common case) match on first
paint and never see anything, while a first-time visitor's modal simply
appears a beat after load instead of being present immediately — a
one-time, once-per-browser trade-off decidedly worth making.

The mobile-only "Kategóriák" accordion (`categoriesOpen` in
`FestivalApp.tsx`) auto-collapses when "Csak a Kedvenceim" is turned on
(but not when turned off) — with the override active the category chips
underneath are already disabled and dimmed (see above), so leaving the
accordion open just wastes screen space showing inert chips on a small
screen.

**Derived scheduling logic** lives in `lib/schedule.ts` as pure functions:
grouping programs by day, splitting all-day vs. timed programs, and
overlap/conflict detection (`overlaps`, `conflictingIds`) used both for the
grid's conflict highlighting and the "Kedvenceim" (saved programs) tab.
`formatWeekday`/`formatWeekdayInitial` sit alongside `formatDay`/
`formatTime` for showing which day of the week a date falls on: the full
Hungarian name next to the date in `ProgramInfoModal.tsx`
("júl. 24. (péntek)"), and just a digraph-aware initial in `DateTabs.tsx`
("júl. 24. P") where there's no room for the full name — "Sz" for
szerda/szombat, "Cs" for csütörtök, not just the first character, since
Hungarian digraphs count as one letter. `formatWeekdayInitial` doesn't
disambiguate szerda from szombat (both "Sz"); that's fine, the date itself
is what's actually unique in that row, the letter is just a quick visual
hint. `SelectedPanel.tsx`'s per-day group headers use the same full-name
pattern as `ProgramInfoModal.tsx` ("júl. 24. (péntek)") rather than the
initial — there's a whole heading row's worth of space there, unlike the
narrow `DateTabs.tsx` tabs.

`sortVenuesWithFavoritesFirst` pins venue rows in three tiers, not two:
starred venues, then *unstarred* venues that merely host a saved
(`selectedIds`) program that day (so a favorited concert never gets lost
scrolling through an alphabetical venue list just because you never starred
its venue), then everything else — each tier alphabetical internally. The
middle tier is recomputed per day in `FestivalApp.tsx` from the already
day/filter-scoped `timed` list, so it naturally only pins on the day the
saved concert actually occurs.

This pin only works if the saved program is actually present in that
day/filter-scoped `timed` list in the first place — `visiblePrograms` in
`FestivalApp.tsx` used to AND the active category/settlement filters onto
every program with no exception, so a saved concert whose category
happened to be deselected (e.g. only "Könnyűzene" active, but you'd
favorited a Jazz set) would drop out of `visiblePrograms` entirely, and
with it, the venue-pinning that depends on it — the only way to see it
again was the separate, exclusive "Csak a Kedvenceim" override, which
hides everything else too. Fixed by giving `selectedIds.has(p.id)` an
unconditional bypass in the *non*-override branch of that filter: a
program you've already selected now always stays visible regardless of
which category/settlement chips are active, so its venue keeps getting
pinned the way it already did for starred venues. This bypass is
deliberately scoped to the plain filtering branch only — it doesn't touch
the separate `anyFavoriteOverride` (Csak a Kedvenceim / Barátaim
Kedvencei) branch, which is an intentionally exclusive "show only these"
view with its own, unchanged behavior. No new visual treatment was needed
for a program appearing this way — the existing selected-program ring
(`shadow-[0_0_0_2px_var(--accent)]` in `ScheduleGrid.tsx`) already makes
clear why it's there despite the active filters.

**Visual identity**: category colors are a hand-picked palette in
`lib/categoryColors.ts` that deliberately overrides the festival API's own
`color` field per category — the API's colors are pale pastels that don't
stay visually distinct in a dense grid; program blocks tint their
background with the category color at 25% alpha (`${color}40` as a hex
alpha suffix) rather than the ~8% (`${color}14`) used earlier, since the
lighter tint didn't separate categories clearly enough at a glance. Design
tokens (`--paper: #f7f7ff`, `--ink: #023047`, `--accent: #3f826d`,
`--pin: #ffb703`, `--danger: #6d1a36`, plus derived `-soft` tint variants
mixed toward `--paper`) live in `app/globals.css` — these are the user's own
exact hex choices, not sampled/derived, so don't adjust the 5 base values
without asking; the three-typeface system (Space Grotesk / IBM Plex Sans /
IBM Plex Mono) is set up in `app/layout.tsx` via `next/font/google` — Plex
Mono is used specifically for times/dates for a "timetable board" feel.
`--saved` (`#3557c0`) is a later, single-purpose addition for the "Csak a
Kedvenceim" filter chip only (see above) — not one of the 5 core tokens,
doesn't need the same by-hand-only rule, but was still chosen deliberately
to avoid colliding with any existing token or settlement color.
`--group-divider` (`#9dc3e6`, a soft blue) is another single-purpose token,
used only for the pinned/plain venue-group divider band in `ScheduleGrid.tsx`
(see below) — deliberately not reusing `--line` (the general hairline/
border color) once the divider became a visible band rather than a border,
since the user wanted it distinctly colored, not just a thicker hairline.

There's no dedicated "muted text" token — secondary/de-emphasized text
throughout the app is plain `--ink` at reduced Tailwind opacity
(`text-ink/NN`), not a separate color. `text-ink/50`, the most-used tier by
far, measured out at only ~2.97:1 contrast against `--paper` (`#7d93a3`
once blended) — well under WCAG AA's 4.5:1 for normal text — so every
`text-ink/50` in the codebase (times, subtitles, inactive tab/chip text,
empty-state copy, related-program metadata) was bumped to `text-ink/70`
(~5.27:1, blends to `#4b6b7e`). Two specific `/40` spots that came up as
separately-reported readability complaints got the same `/70` treatment:
the grid's hour-axis labels (`ScheduleGrid.tsx`) and `SelectedPanel.tsx`'s
per-day headers. The remaining `/40` uses (placeholder text, modal close
buttons, a couple of uppercase eyebrow labels) are untouched — they weren't
flagged, so don't reflexively bump every `/40` you find; treat `/70` as the
standard for *readable* secondary text going forward, but leave the
deliberately-faint `/40` tier alone unless it's specifically called out.

The venue header cell in `ScheduleGrid.tsx` deliberately does **not** tint
its background differently for starred or pin-tier venues — every venue
gets the same treatment regardless of favorite/pin state: `backgroundColor:
settlement.solid` (the saturated variant) with a lighter `border-t-[3px]`
in `settlement.soft` on top only (`borderTopColor`, no border on the other
three sides). This is inverted from how it reads at first glance — solid
color is the *base* fill, soft is just the thin accent stripe — chosen
because a solid, more saturated fill reads as more deliberate/branded than
the pale tint version did, and the venue name is `font-bold text-xs` (up
from `font-medium text-[11px]`) to stay legible against the stronger
background. Favorite/pin state is carried *only* by the ☆/★ glyph: empty
outline (☆) for a plain venue, a solid ink-colored ★ for a starred venue,
and — for the "unstarred venue that merely hosts a saved concert today" pin
tier — a vertically-split half star (a `★` clipped to its left 50% via
`clipPath: inset(0 50% 0 0)`, colored `--pin`, layered over the base ☆
outline) rather than a full star or a background tint. This replaced an
earlier version where the pin tier got a solid `--pin-soft` background
(and, before that, starred venues got an `--accent-soft` background) — both
were dropped because a colored header background competed visually with
the always-on settlement-color stripe for the same cell; the glyph is now
the only channel for favorite/pin state, so `--pin-soft` is currently
unused (kept defined in `globals.css` for palette symmetry, not referenced
by any component).

Separately from the per-venue glyph, `ScheduleGrid.tsx` draws one
full-row-width **group divider band** (`h-1.5`, `--group-divider`, a soft
blue chosen specifically for this one purpose) at the single point in the
already-sorted venue list where `sortVenuesWithFavoritesFirst`'s "pinned"
tiers (starred, or unstarred-with-a-saved-program) end and the plain tier
begins. `ScheduleGrid` doesn't receive the tier boundary as a prop — it
recomputes `isFavorite`/`hasSelectedProgram` per venue the same way the
per-row rendering already does, walks the list once tracking the previous
venue's pinned-state, and records the *first* venue id where pinned flips
to not-pinned (`dividerBeforeVenueId`). The venue list render loop is a
`flatMap` (not `map`) specifically so it can prepend that one extra
band element right before that venue's row without changing keys elsewhere.
The band needs an explicit `width: VENUE_COL_WIDTH + gridWidth` — unlike
the venue/timeline rows, it has no children of its own to size a `w-max`
against, so `w-max` alone silently collapses it to zero width.

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
state off the background and onto the star glyph. `SelectedPanel.tsx`'s
"Kedvenceim" list reuses the same palette too: a `h-3.5 w-3.5` solid dot on
the right edge of each saved program shows the settlement color of its
venue, at a glance, without repeating the settlement name as text.

**Mobile**: the category filter row collapses behind a toggle below the
compound "spacious" breakpoint (state in `FestivalApp.tsx` — see above for
why it's not plain `sm:`) to leave more vertical space for the grid; above
that breakpoint it's always shown regardless of that state.

**PWA / offline support**: `app/manifest.ts` uses Next's built-in
`MetadataRoute.Manifest` route convention (no extra package), with
`public/icon.svg` — a small hand-drawn icon (dark `--ink` background, a few
`--paper` grid lines plus `--accent`/`--pin` blocks) echoing the same
timetable-grid motif as the rest of the app's glyphs, rather than a
photographic icon. `sizes: "any"` avoids needing a PNG-rasterization build
step. `public/sw.js` is a **hand-written service worker**, deliberately not
using Serwist/Workbox: Next's own docs recommend Serwist for offline
support, but Serwist currently requires webpack config, while this project
builds with Turbopack (`next build` prints "Next.js 16.2.10 (Turbopack)") —
a webpack-plugin-based tool would be unreliable here. The hand-written
worker is intentionally minimal: network-first, cache-fallback on `fetch`,
with no build-time precache list (Next's hashed `_next/static/...`
filenames change every build, so there's nothing stable to precache
up front) — it just learns at runtime what it's already seen successfully
over the network. `components/ServiceWorkerRegister.tsx` registers it from
a `useEffect` (no `setState` inside, so it's fine under the
`set-state-in-effect` rule) mounted in `app/layout.tsx` — **but only when
`process.env.NODE_ENV === "production"`**. Registering it under `next dev`
too was tried first and broke Turbopack's own HMR: the service worker's
`fetch` handler intercepted the dev-only HMR asset requests (which get a
new filename hash on every recompile), and the browser surfaced this as
`ChunkLoadError`s and "A ServiceWorker intercepted the request and
encountered an unexpected error" — not an app bug, but a real, disruptive
one caused by having *any* active service worker during development. In
the `else` (dev) branch, the component actively calls
`getRegistrations().forEach(r => r.unregister())` and clears all Cache
Storage entries, so a browser that previously ran the production build
against `localhost:3000` (as every verification pass in this project does)
self-heals on the next dev-mode reload with no manual DevTools steps
needed — don't remove that cleanup branch even though it looks like dead
code most of the time.

One consequence worth knowing if this ever needs debugging: **the very
first page load is never itself cached**, because the service worker only
registers (and its `fetch` handler only starts intercepting requests) via
that `useEffect`, which runs *after* the initial HTML has already been
requested over the network by the browser. So a first-time visitor who
goes offline immediately after that first load will *not* get a working
offline page — the document itself was fetched before the worker existed
to observe and cache it. The worker install/activate/claim happens in the
background during that first visit, so the *second* visit onward (even
still online, e.g. a reload) is what actually gets captured into the
runtime cache; only from that point does an offline reload serve
correctly. This matches real installed-PWA behavior (first visit installs
silently, subsequent visits are what get cached) and was confirmed via
Playwright: `context.setOffline(true)` alone didn't reliably trigger the
worker's cache fallback in this Chromium/Playwright combination, but a
real CDP-level `Network.emulateNetworkConditions({offline: true})` after a
second (still-online) reload did — worth remembering if a future offline
test seems to fail for no obvious reason.

Offline caching itself works independent of whether the site is "installed"
(added to the home screen) — the service worker runs in an ordinary browser
tab too. Installing only adds the standalone/full-screen presentation and,
on iOS Safari specifically, a somewhat more durable cache (an
uninstalled tab's cache is more likely to be evicted by the OS after a
period of inactivity than an installed one's).

**Sharing favorites via QR code** ("Barátaim" — friends): the app has no
database, so a friend's shared selection has to travel entirely inside a
URL the QR code encodes — the QR is just a convenient scanning surface for
an ordinary link, not a separate transport. `components/ShareFavoritesModal.tsx`
builds `${origin}${pathname}?friend=<name>&ids=<comma-separated program
ids>` from the sharer's currently-selected programs and their own display
name (asked once, then persisted via `hooks/useOwnName.ts`, the same
single-value `useSyncExternalStore` shape as `useHasSeenIntro.ts`), then
renders it as an `<img>` via the `qrcode` package's `QRCode.toDataURL()`
inside a `useEffect` (this one's fine under `set-state-in-effect` too,
since the `setState` happens inside the async `.then()` callback, not
synchronously in the effect body — the rule targets the latter, not
legitimate async side effects). `qrcode` (+ `@types/qrcode`) is a real,
saved `dependencies` entry, unlike `playwright-core` — it ships in the
production bundle, it isn't a verification-only tool.

Reading the incoming `?friend=&ids=` on the receiving end deliberately
does **not** use Next's `useSearchParams()`: I checked
`node_modules/next/dist/docs/.../use-search-params.md` (per AGENTS.md,
since this Next version can differ from training data) and confirmed that
a static/ISR page (this app's `app/page.tsx` is one) must wrap any
`useSearchParams()`-using Client Component in `<Suspense>` or the
production build fails outright. Since this project doesn't use Next's
router hooks anywhere else, `hooks/useImportRequest.ts` instead reads
`window.location.search` once through the same
`ensureInitialized`/module-level-state pattern as `idSetStore.ts` — ordinary
`useSyncExternalStore`, `getServerSnapshot` returns `null` (nothing pending
during SSR/first paint), no Suspense boundary needed anywhere.
`clearRequest()` both clears the in-memory pending request and strips the
query params via `history.replaceState` so a refresh doesn't re-prompt.

`hooks/useFriendFavorites.ts` stores `{ name, programIds }[]` in
`localStorage`, structured (not a plain `Set<number>`) so it can't reuse
`hooks/idSetStore.ts`'s `createIdSetStore` factory, but follows the exact
same subscribe/getSnapshot/getServerSnapshot/module-level-state shape.
`addFriend(name, ids)` **replaces** any existing entry with the same
`name` rather than adding a duplicate — a deliberate choice (confirmed with
the user) so re-scanning an updated QR from the same person updates their
list instead of piling up a second "Anna" entry; there's no other identity
to key on since there are no accounts. `components/ImportFriendFavoritesModal.tsx`
validates the scanned ids against the live `data.programs` and silently
drops any that no longer exist (e.g. a stale QR from a previous session)
rather than erroring; if none remain valid it shows a short "couldn't read
this" message instead of an empty-but-still-offered import.

The "Kedvenceim" tab gained its own internal sub-tab switcher (`kedvenceimTab`
in `FestivalApp.tsx`, "Saját"/"Barátaim", same pill visual pattern as the
top-level view tabs) rather than mixing both lists into one view — "Saját"
is the pre-existing `SelectedPanel`, unchanged; "Barátaim" is the new
`components/FriendFavoritesPanel.tsx`. Each friend's row is its own
expand/collapse accordion (local `Set<string>` of expanded names) rather
than always showing every program inline — with several friends this
would otherwise get very long. Expanded, a friend's programs render as a
day-grouped list (same shape as `SelectedPanel`: `formatDay`/`formatWeekday`
header, time + location, settlement-colored dot, click-through to the same
shared `ProgramInfoModal`) — this list was added after initial ship because
the first version only showed a bare program *count* per friend, and the
user pointed out the actual programs were only visible indirectly by
switching to the grid and turning on the filter (see below), not as a list
in this tab where you'd expect one.

On the grid (Programtábla), `onlyFriendFavorites` is a second boolean
alongside the pre-existing `onlyFavorites`, **OR**-combined (not
replacing it): `anyFavoriteOverride = onlyFavorites || onlyFriendFavorites`,
and the visible-programs filter becomes `(onlyFavorites &&
selectedIds.has(p.id)) || (onlyFriendFavorites &&
allFriendProgramIds.has(p.id))` when either is on — so both can be active
at once and the grid shows the union, exactly the "select them together"
behavior the user asked for, rather than one replacing the other.
`allFriendProgramIds` is a `useMemo`'d union (`friends.flatMap(f =>
f.programIds)`) recomputed only when `friends` changes. The new "Barátaim
Kedvencei" chip uses its own token, `--friend` (`#7c3aed`, violet) —
distinct from `--saved`'s cobalt blue and every other token — and, like
`onlyFavorites`, flipping it on dims/disables the real category chips
(`CategoryFilter`'s `disabled` prop is now driven by `anyFavoriteOverride`,
not just `onlyFavorites`) and auto-collapses the mobile "Kategóriák"
accordion. Deliberately out of scope (not requested): friend-saved
programs do **not** pin their venue to the top of the grid the way the
user's own `selectedIds` do in `sortVenuesWithFavoritesFirst` — that pin-tier
logic is unchanged and only ever looks at the user's own selections.

`components/CopyButton.tsx` was extracted out of `VenueDetails.tsx` (where
it started as a local, non-exported helper) specifically so
`ShareFavoritesModal.tsx` could reuse it for copying the share link — same
⧉/✓ toggle, no behavior change at either call site.

**Own-favorites export/import** ("Saját" sub-tab of "Kedvenceim"): a
distinct mechanism from the friend-sharing QR feature above — that one
transfers a *subset* of favorites to a *named other person*'s "Barátaim"
list; this one transfers *all* of your own favorites (both selected
programs and starred venues) to *your own* browser on another
device/session, merging into whatever's already there rather than
attributing them to anyone. Because the two must never collide,
`components/ExportFavoritesModal.tsx` builds its link with a completely
different query-param pair, `?myprograms=<id,id,...>&myvenues=<id,id,...>`
(vs. the friend feature's `?friend=&ids=`), and `hooks/useOwnImportRequest.ts`
is a separate `useSyncExternalStore` reader (same shape as
`hooks/useImportRequest.ts`) keyed off those two params instead. There's
no name-entry step in `ExportFavoritesModal.tsx` — unlike
`ShareFavoritesModal.tsx`, it doesn't use `useOwnName` at all, since the
data isn't being attributed to anyone.

Importing needs to *add to*, not replace, whatever's already in the
target browser's own `selectedIds`/`favoriteIds` — this only works
because `hooks/idSetStore.ts`'s `createIdSetStore` factory gained a second
mutator, `addMany(ids)`, alongside the pre-existing `toggle(id)`: it
unions the given ids into the existing set and persists once, rather than
looping `toggle` (which would incorrectly *remove* any id already
present). Both `useSelectedPrograms` and `useFavoriteVenues` now expose
this `addMany` alongside their existing `toggle`.

`components/ImportOwnFavoritesModal.tsx` renders one of two states from a
single component rather than two separate modals, since they share the
same confirm-dialog UI once a pending request exists: (1) if
`useOwnImportRequest()` already has a request (i.e. the visitor arrived
via a link/QR carrying `?myprograms=&myvenues=`), it shows the
programs/venues count and a Hozzáadás/Mégse confirm, validating both id
lists against the live `data.programs`/`data.locations` the same way
`ImportFriendFavoritesModal` validates program ids — invalid/stale ids
are silently dropped, and an all-invalid result shows the same
"couldn't read this" fallback pattern; (2) if there's no such pending
request but the modal was opened manually (see below), it instead shows a
plain text input for **pasting a full previously-exported link** — parsed
via `new URL(...)`, then handed to `useOwnImportRequest`'s
`setRequestFromUrl(rawUrl)`, which re-parses the same two params and (if
either list is non-empty) updates the shared pending-request state so the
component's own next render falls into case (1) and shows the identical
confirm dialog. This second, manual mode exists specifically for
transferring the link a way other than scanning a QR with the *same*
browser it needs to land in — e.g. pasted from an email or notes app —
without it auto-triggering the moment the link is merely visited.
`components/SelectedPanel.tsx` gained the "Exportálás QR-kóddal"/
"Importálás" button row that opens these two flows; unlike the rest of
`SelectedPanel`'s content, this row renders *above* the empty-state early
return (restructured into a shared `actionButtons` JSX const referenced
from both branches) so both buttons — and hence the manual-import path in
particular — stay reachable even before you've selected a single program.

**Vercel Analytics**: `<Analytics />` from `@vercel/analytics/next` is
mounted once in `app/layout.tsx`, alongside the existing always-on
`<ServiceWorkerRegister />` in `<body>`. It's a real `dependencies` entry
(ships in the production bundle), unlike `playwright-core`. Locally
(`next dev`/`next start`) the component still injects the
`/_vercel/insights/script.js` tag and the browser requests it — that
request 404s outside of an actual Vercel deployment, which is expected;
Vercel's own hosting layer is what serves that script and records the
pageview in production, so this only starts reporting data (visible on
the project's Analytics dashboard tab) after the next deploy.

**Sharing the site itself via QR code**: `components/ShareSiteQrButton.tsx`
sits in `ScheduleGrid.tsx`'s sticky top-left corner cell as a sibling of
the existing ⓘ button (that cell's `flex items-center justify-center`
gained a `gap-1.5` to fit both) — a small circular bélyegkép the same
`h-6 w-6` size as ⓘ, click-to-enlarge into a modal with a bigger QR, the
raw URL, and a `CopyButton`. This is a different case from the
`ShareFavoritesModal`/`ExportFavoritesModal` QR features above: those
encode dynamically-built links carrying the *user's own data*
(`?friend=&ids=` / `?myprograms=&myvenues=`); this one encodes a single
fixed constant, `SITE_URL = "https://muvolgy.vercel.app/"` — deliberately
hardcoded rather than derived from `window.location`, since the point is
always sharing the real deployed site regardless of where the code
happens to be running (a `window.location`-based link would produce a
useless `localhost:3000` QR during local dev/testing). The component
generates one 240×240 `qrcode` data URL and reuses the same image at both
the small (24×24, `overflow-hidden` on the circular button since the QR
image itself is square) and enlarged sizes — downscaling a QR pattern for
a thumbnail that's never meant to be independently scanned costs nothing,
so there's no reason to generate a second, separately-sized image just
for the thumbnail. Unlike `AppInfoModal` (which needs `FestivalApp.tsx`
to own its open state for the shared first-visit auto-open logic), this
widget's open/closed state is entirely local to itself — no prop
threading through `ScheduleGrid` or state in `FestivalApp.tsx` needed,
since nothing else in the app needs to observe or trigger it.

Its enlarged-QR modal is rendered via `createPortal(..., document.body)`
rather than inline — a real, user-reported bug on small screens turned
out to be a classic CSS stacking-context trap: the button (and therefore
its modal, before this fix) lives *inside* `ScheduleGrid.tsx`'s sticky
top-left corner cell, which is itself nested inside the sticky header
row — both use `position: sticky` with an explicit `z-index`, and each
of those creates its own stacking context. A `position: fixed`
descendant's on-screen *position* escapes non-transformed ancestors, but
its *stacking order* does not escape an ancestor that establishes a
stacking context — so the modal's `z-30` was only ever being compared
against its immediate siblings inside that trapped local context, not
against the rest of the page, and on narrow viewports it could end up
rendered underneath other content (e.g. the mobile category-filter
accordion) instead of on top of everything as intended. Portaling the
modal straight to `document.body` sidesteps the whole ancestor-stacking
hierarchy, matching how every other modal in this app already behaves
(none of the others are nested inside a `sticky`+`z-index` ancestor, so
none of them had this problem) — confirmed via Playwright that the
overlay's DOM parent is now literally `<body>`, and that
`document.elementFromPoint` at the modal's own heading resolves to the
modal itself, not whatever used to render above it.

**"Kedvenceim" gained a third sub-tab, "Export/Import"** (alongside
"Saját"/"Barátaim", same pill switcher), extracted into its own
`components/ExportImportPanel.tsx`. The "Exportálás QR-kóddal"/
"Importálás" buttons used to live at the top of `SelectedPanel.tsx` (see
the own-favorites export/import section above) — moved out because they
apply to your *own* favorites as a cross-cutting action, not something
that belongs visually bundled with the "Saját" program list itself;
`SelectedPanel.tsx` reverted back to just the program list (no more
`onExport`/`onImport`/`canExport` props, no more `actionButtons` const,
back to its original single-purpose shape). `ExportImportPanel` takes the
same three props (`onExport`, `onImport`, `canExport`) that
`SelectedPanel` used to, plus a short explanatory paragraph about what
export/import actually does — `FestivalApp.tsx`'s `kedvenceimTab` state
grew a third value, `"atvitel"`, rendering this panel instead of
`SelectedPanel`/`FriendFavoritesPanel`.

**Address/coordinates get an explicit label**: `VenueDetails.tsx` now
prefixes the address line with `Cím: ` and the coordinate line with
`Koordináta: ` (when a real value exists — the "no address" fallback
sentence stays unprefixed, since it isn't actually an address). The
`CopyButton` next to each still copies the *raw* address/coordinate value
without the label, not the label-prefixed displayed text — pasting
"Cím: Fő utca 12" into Google Maps would break the search, so the label
is purely a visual affordance, not part of the copyable value.

**Modal max-height fix**: `ProgramInfoModal.tsx` and `VenueInfoModal.tsx`
had no height cap on their own box, unlike `AppInfoModal.tsx` and the
export/import/share QR modals — fine as long as their content stayed
short, but a program with an unusually long "further appearances by this
artist" name list (or, on `VenueInfoModal`, a long address) could grow
taller than a small phone's viewport (reported on an iPhone 8, e.g. the
"Emingo" concert), with no way to scroll down to the rest of the modal
or its close button. Fixed by adding the same `max-h-[85vh]
overflow-y-auto` already used elsewhere in this codebase for exactly this
reason — the modal box now scrolls internally instead of extending past
the viewport.

**"Barátaim Kedvencei" chip only shows once you have a friend**:
`FestivalApp.tsx`'s grid filter row used to always render the "Barátaim
Kedvencei" chip, even with an empty `friends` list — pointless (there's
nothing to filter to) and confusing (a working-looking toggle that can
never show anything). Now gated behind `friends.length > 0`. This also
surfaced a latent stuck-state bug worth remembering: if `onlyFriendFavorites`
were ever `true` at the moment the last friend gets removed, the chip
(now hidden) would leave no way to turn the override back off, silently
freezing the grid on an empty filter with the category chips still dimmed.
Fixed by deriving `effectiveOnlyFriendFavorites = onlyFriendFavorites &&
friends.length > 0` and using *that* (not the raw state) everywhere the
override actually affects behavior (`anyFavoriteOverride`, the
`visiblePrograms` filter) — same "derive for render, no effect needed"
approach used elsewhere in this file (e.g. the intro-modal auto-open
logic), so the override self-clears the instant the friend list empties,
with no extra state or effect required.

**QR images needed to shrink on narrow phones**: `ShareSiteQrButton.tsx`'s
enlarged QR (and, for the same latent reason, `ExportFavoritesModal.tsx`'s
and `ShareFavoritesModal.tsx`'s) rendered its `<img>` with hardcoded
`width={240} height={240}` and no responsive CSS — fine on most phones,
but on a narrow enough screen (confirmed via Playwright down to a 280px
viewport) the fixed-pixel image could exceed the available width inside
the modal's padding. Each now also has `h-auto max-w-full` in its
`className`, so the browser derives the aspect ratio from the `width`/
`height` attributes (a standard modern-browser behavior, not a hack) and
scales the image down to fit whatever width is actually available, rather
than overflowing. `width`/`height` attributes are kept as-is (not
removed) since they're still what let the browser lay out the correct
aspect ratio before the image loads.

**In-app camera QR scanner on the "Barátaim" tab**: previously, importing
a friend's shared favorites required scanning their QR with the phone's
own OS camera app (which just opened the link, letting
`hooks/useImportRequest.ts` pick up `?friend=&ids=` from
`window.location.search` on load) — now `components/FriendFavoritesPanel.tsx`
opens a live in-app camera view immediately, decoding QR codes directly
without leaving the app, via `components/FriendQrScanner.tsx`. Uses
`jsqr` (a small, dependency-free, worker-free pure decode function
operating on raw pixel data) rather than the `qr-scanner` npm package or
the native `BarcodeDetector` API: `qr-scanner` ships a separate worker
file that typically needs copying into `public/`/bundler-specific config
— the same class of build friction that already ruled out Serwist/Workbox
in favor of the hand-written service worker (see PWA section above);
`BarcodeDetector` isn't implemented in Safari/WebKit at all, i.e. no iOS
support, a dealbreaker given this app's iPhone-heavy user base (see the
iPhone 8 modal-overflow bug above). `jsqr` needed no ambient type
declaration — it ships its own `dist/index.d.ts`.

`FriendQrScanner.tsx` splits camera lifecycle from decoding into two
separate effects: one (`[]` deps, runs once) owns `getUserMedia`/`<video>`
wiring and stops the `MediaStream` tracks on unmount — since this
component is only ever mounted while `kedvenceimTab === "baratok"`,
switching to "Saját"/"Export/Import" unmounts it and releases the camera
automatically, no extra signaling needed (confirmed via Playwright: spied
on `MediaStreamTrack.prototype.stop` via `page.addInitScript`, asserted
it fires on tab switch). The second effect runs a
`requestAnimationFrame` loop drawing the live video frame to a hidden
`<canvas>` and feeding the pixel data to `jsQR`, gated on an `active` prop
from the parent — *only this decode loop* pauses/resumes around the
confirm dialog (`ImportFriendFavoritesModal`, via
`scannerActive = importRequest === null` in `FriendFavoritesPanel.tsx`),
the camera stream itself is never torn down and restarted for this,
avoiding both a visible flicker and a repeat permission prompt.

A real bug only surfaced during Playwright verification with Chromium's
`--use-file-for-fake-video-capture` (a static looping QR image, standing
in for "the phone is still pointed at the same code the instant scanning
resumes"): tapping "Hozzáadás" cleared the pending request and
immediately resumed the decode loop, which re-decoded the still-visible,
unchanged frame and reopened the identical confirm dialog right away.
Fixed with a `lastDecodedRef` in `FriendQrScanner.tsx` that skips firing
`onDecoded` again for a value identical to the last one actually
decoded — a genuinely new/different QR still fires normally, only an
exact repeat is suppressed. This ref persists for the scanner's whole
mounted lifetime (not reset per pause/resume), so re-scanning the same
friend's QR later in the same sitting requires leaving and re-entering
the Barátaim tab (a fresh component instance) — an acceptable trade-off
versus the alternative of nagging the same confirm dialog on every frame.

`hooks/useImportRequest.ts` gained a `setRequestFromUrl(rawUrl): boolean`
function — the exact same pattern `hooks/useOwnImportRequest.ts` already
had for its own manual-paste flow, just validating `friend`+`ids` instead
of `myprograms`/`myvenues` (both required, matching this hook's existing
`parseFromLocation` invariant, unlike the "either list" OR-rule the own-
favorites version uses). This one function is shared by both the
scanner's `onDecoded` callback and `FriendFavoritesPanel.tsx`'s new
always-visible paste-a-link field (mirroring `ImportOwnFavoritesModal.tsx`'s
manual-paste UI/copy shape) — `ImportFriendFavoritesModal.tsx` itself
needed zero changes, since it only ever reads the resulting
`importRequest`/`clearRequest` state, agnostic to whether it arrived via
the initial page URL, a camera decode, or a pasted link.

**Own domain**: the app now also lives at `muvolgyprogi.hu` (the user
bought this domain), so `components/ShareSiteQrButton.tsx`'s hardcoded
`SITE_URL` constant was updated from `https://muvolgy.vercel.app/` to
`https://muvolgyprogi.hu/` — the QR code and its copy-link both point
there now. This is purely an in-app string change; whether the domain
actually resolves to the Vercel deployment depends on the domain's own
DNS + the Vercel project's domain configuration, both set up outside this
codebase.

**Default day tab now uses Budapest's own calendar date, not the
visitor's device timezone or UTC**: `FestivalApp.tsx`'s `defaultDay`
used to compute "today" via `new Date().toISOString().slice(0, 10)` —
UTC's calendar date. Since the festival only ever runs in Hungary, this
was wrong in two ways: (1) a visitor whose device is set to a different
timezone (e.g. a foreign tourist) would land on *their own* local day,
not Budapest's; (2) even for a Hungarian-timezone visitor, UTC's date
lags Budapest's by a day during the roughly 1-2 hours after midnight
Budapest time (CEST is UTC+2), so loading the page at, say, 00:30
Budapest time would default to *yesterday's* tab. Fixed with a
`budapestToday()` helper using `Intl.DateTimeFormat("en-CA", { timeZone:
"Europe/Budapest", ... })`, which derives Budapest's calendar date
directly from the UTC instant, independent of the visitor's own device
settings. Verified via Playwright with `context.newContext({ timezoneId:
... })` + `page.clock.install(...)`: a browser set to `America/Los_Angeles`
at a UTC instant that's 08:00 in Budapest still defaults to Budapest's
date, and a UTC-timezone browser at 23:30 UTC (01:30 in Budapest, past
midnight) correctly rolls over to Budapest's *next* day rather than
staying on UTC's date. This only changes which day tab is initially
selected — every other day remains just as browsable via `DateTabs` as
before, nothing about day navigation itself changed.

**A "should day 0 show up" question turned out to be an upstream data
gap, not an app bug**: the official festival homepage states the 2026
dates as "07.24 - 08.02" (10 days), but the backend API this app reads
from (`/api/v1/dates` and `/api/v1/programs`, sampled across all ~40
pages) currently has zero programs and no entry at all for July 24 — the
earliest date present anywhere in the live data is July 25. Confirmed
this isn't a bug in `lib/api.ts`'s day-list logic (`days` comes directly
from `/api/v1/dates`, not derived/filtered from program data) by
cross-checking the raw API response directly. Deliberately did **not**
patch around this the way `LOCATION_OVERRIDES`/`CATEGORY_OVERRIDES` patch
single missing fields for known entities — there's no citable list of
actual July 24 programs to add, and fabricating an empty placeholder day
would be guessing at a UI decision (what does an intentionally-empty day
tab even communicate to a visitor?) for a gap that this app's whole
live-fetch, `revalidate: 3600` architecture already self-heals the moment
the festival's own backend publishes that day — consistent with the
override files' own stated principle of only filling gaps from a
verified source, never inventing one.

**Domain migration bridge** (`muvolgy.vercel.app` → `muvolgyprogi.hu`):
`localStorage` is origin-scoped, so simply pointing the old domain at the
new one (even via a plain HTTP redirect) would silently strand
everyone's favorites, starred venues, Barátaim list, and own name on the
old origin with no way back. The critical constraint this depends on:
**the Vercel project must NOT use its own built-in "redirect to primary
domain" feature** for `muvolgy.vercel.app` — that redirects at the
server/edge level, before any of this app's client-side JS ever runs, which
would make the migration below impossible (confirmed via `AskUserQuestion`
that this hadn't been turned on yet, and via `curl -I` that the old domain
still serves the real app with HTTP 200, no redirect). Both domains must
keep pointing at the *same* live deployment.

`components/DomainMigrationRedirect.tsx`, mounted in `app/layout.tsx`
alongside `ServiceWorkerRegister`/`Analytics`, only activates when
`window.location.hostname === "muvolgy.vercel.app"` exactly (not "anything
that isn't the new domain," so local dev and Vercel preview deployments
are unaffected). On the old domain, it reads the current
`selectedIds`/`favoriteIds`/`friends`/`ownName` via the same hooks
`FestivalApp.tsx` already uses, and redirects (`window.location.href`,
in a `useEffect`) either to a bare `https://muvolgyprogi.hu/` (nothing to
carry) or to that same URL carrying everything via the *existing*
own-favorites export/import mechanism — reusing it rather than inventing
a parallel migration-specific scheme. Shows a brief full-screen
"Átköltöztünk…" message with a plain fallback link while the redirect
fires, in case the script-based redirect doesn't for any reason. This is
a **temporary bridge**, worth removing once traffic to the old domain
drops to near zero.

To carry the Barátaim list and own name (previously out of scope for the
own-favorites export/import feature), that mechanism itself grew two new
optional URL params, `myfriends` (JSON-encoded `FriendFavorite[]`) and
`myname`:
- `lib/ownFavoritesUrl.ts` (new): `buildOwnFavoritesUrl(baseUrl, {
  programIds, venueIds, friends, ownName })`, extracted out of
  `ExportFavoritesModal.tsx` (which used to build this URL inline)
  specifically so `DomainMigrationRedirect.tsx` could reuse the exact
  same param-building logic against a *different* base URL (the literal
  new-domain origin, not `window.location.href` like the manual export
  modal uses) — only sets a param when there's actually something to put
  in it, so a no-data migration redirect ends up as a clean bare URL
  rather than `?myprograms=&myvenues=`.
- `hooks/useOwnImportRequest.ts`: `OwnImportRequest` gained `friends`/
  `ownName` fields; the "is this request valid" check now passes if
  *any* of the four fields has content (previously required at least one
  of programs/venues) — a link carrying only a name and friends, with no
  programs or venues selected, is still a legitimate request.
- `components/ImportOwnFavoritesModal.tsx`: the confirm dialog now lists
  whichever of "N programot", "M helyszínt", "K barátot", "a nevedet"
  actually has content (joined into one sentence, not four separate
  hardcoded slots) and, on confirm, adds each incoming friend via the
  existing `addFriend` (same replace-by-name rule as everywhere else) and
  only adopts the incoming name if the destination **doesn't already
  have one set** — deliberately non-destructive, matching the "merge,
  never overwrite" principle the rest of this import flow already
  follows for programs/venues.
- **Side effect, deliberately kept**: since `ExportFavoritesModal.tsx`
  now also calls `buildOwnFavoritesUrl` with `friends`/`ownName`, the
  ordinary, manually-triggered "Exportálás QR-kóddal" button (Export/Import
  tab) now carries the Barátaim list and own name too, not just
  programs/venues — a deliberate, coherent widening (moving to a new
  phone should reasonably bring your friends/name along too), not just an
  implementation detail needed for the domain migration.

Verified end-to-end with a real (self-signed-cert) local HTTPS proxy
standing in for both domains, rather than only testing the URL-building
logic in isolation — `--host-resolver-rules` alone wasn't enough because
Chromium's built-in HSTS preload list forces `muvolgy.vercel.app` to
HTTPS even for local testing, so a plain `http://` test would fail with
`ERR_SSL_PROTOCOL_ERROR` before ever reaching the app's own logic. With
the proxy in place: an old-domain visit with saved data produces the
fully-populated migration link; an old-domain visit with nothing saved
redirects to a bare URL; and landing on the (simulated) new domain with
the captured link shows the correct multi-part confirm sentence and
actually populates all four localStorage keys on "Hozzáadás".
