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
endpoint (only ~44% of venues have precise geo data — the rest fall back to a
text search), and normalizes everything into the `Program`/`Location`/
`Category` shapes in `lib/types.ts`. Every `fetch` uses `next: { revalidate:
3600 }` (Next's pre-Cache-Components model — `cacheComponents` is *not*
enabled in `next.config.ts`). The fully-loaded dataset is passed as a prop
into `components/FestivalApp.tsx`, a single client component that owns all
interactive state (selected day, active categories, view tab) and filters/
groups the in-memory dataset — there's no per-filter refetching.

**Grid rendering** (`components/ScheduleGrid.tsx`): the schedule is *not* a
CSS grid. Each program is absolutely positioned (`top`/`height` in pixels
computed from a pixel-per-minute constant) within its venue's column, because
programs have irregular durations that a row-based grid can't represent
cleanly. When multiple programs in the same venue overlap in time, a greedy
interval-graph lane assignment (in `ScheduleGrid.tsx`) lays them out
side-by-side instead of stacking; a column's width grows with its peak
concurrency (some venues like "Főtér" have 25+ simultaneous market-stall
programs) so text stays readable instead of being squeezed into slivers.

**Persistence**: selected programs and starred venues are both backed by the
same localStorage-synced store factory, `hooks/idSetStore.ts`
(`createIdSetStore(key)`), built on `useSyncExternalStore` rather than
`useState` + `useEffect` — this was a deliberate choice after
`eslint-plugin-react-hooks`'s `set-state-in-effect` rule flagged the more
obvious effect-based approach; it also sidesteps SSR/hydration mismatches
since `getServerSnapshot` always returns an empty set.

**Derived scheduling logic** lives in `lib/schedule.ts` as pure functions:
grouping programs by day, splitting all-day vs. timed programs, sorting
venues with starred ones pinned first (`sortVenuesWithFavoritesFirst`), and
overlap/conflict detection (`overlaps`, `conflictingIds`) used both for the
grid's conflict highlighting and the "Sajátjaim" (My programs) tab.

**Visual identity**: category colors are a hand-picked palette in
`lib/categoryColors.ts` that deliberately overrides the festival API's own
`color` field per category — the API's colors are pale pastels that don't
stay visually distinct in a dense grid. Design tokens (`--paper`, `--ink`,
`--accent`, `--line`, `--danger`) live in `app/globals.css`; the three-typeface
system (Space Grotesk / IBM Plex Sans / IBM Plex Mono) is set up in
`app/layout.tsx` via `next/font/google` — Plex Mono is used specifically for
times/dates for a "timetable board" feel.

**Mobile**: the category filter row collapses behind a toggle below the `sm`
breakpoint (state in `FestivalApp.tsx`) to leave more vertical space for the
grid; above `sm` it's always shown regardless of that state.
