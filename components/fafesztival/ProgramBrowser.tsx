"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import {
  DAYS,
  DISTRICTS,
  FEATURES,
  KINDS,
  PROGRAMS,
  REGISTRATION_URL,
  conflictingIds,
  toMinutes,
  type Day,
  type Feature,
  type Kind,
} from "@/lib/fafesztival/data";
import { useFfFavorites } from "@/lib/fafesztival/favorites";
import { ProgramCard } from "./ProgramCard";
import { DAY_COLOR } from "./ui";
import { ArrowRight, CaretDown, CaretRight, FEATURE_ICON, ICON, MagnifyingGlass, Plant, Star } from "./icons";

type DayChoice = Day | "all";
const PARTS = [
  { id: "de", label: "Délelőtt", test: (m: number) => m < 12 * 60 },
  { id: "du", label: "Délután", test: (m: number) => m >= 12 * 60 && m < 17 * 60 },
  { id: "este", label: "Este", test: (m: number) => m >= 17 * 60 },
] as const;

function budapestToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Budapest",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
const noopSubscribe = () => () => {};

const fold = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

function Chip({
  on,
  onClick,
  children,
  color,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={`inline-flex min-h-10 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
        on ? "text-white" : "bg-ff-olive/8 text-ff-olive hover:bg-ff-olive/15"
      }`}
      style={on ? { background: color ?? "var(--ff-olive)" } : undefined}
    >
      {children}
    </button>
  );
}

export function ProgramBrowser() {
  // "Today" only exists on the client; deriving the default from it (instead
  // of setting state in an effect) keeps the prerendered HTML on "all days".
  const today = useSyncExternalStore(noopSubscribe, budapestToday, () => null);
  const festivalToday = DAYS.find((d) => d.id === today)?.id ?? null;
  const [picked, setPicked] = useState<DayChoice | null>(null);
  const day: DayChoice = picked ?? festivalToday ?? "all";

  const [features, setFeatures] = useState<Set<Feature>>(new Set());
  const [kinds, setKinds] = useState<Set<Kind>>(new Set());
  const [parts, setParts] = useState<Set<string>>(new Set());
  const [onlyFav, setOnlyFav] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [q, setQ] = useState("");
  const { selectedIds } = useFfFavorites();

  const toggleIn = <T,>(set: Set<T>, v: T, setter: (s: Set<T>) => void) => {
    const next = new Set(set);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    setter(next);
  };

  const conflicts = useMemo(() => conflictingIds(PROGRAMS.filter((p) => selectedIds.has(p.id))), [selectedIds]);

  const visible = useMemo(() => {
    const words = fold(q.trim()).split(/\s+/).filter(Boolean);
    return PROGRAMS.filter((p) => {
      if (day !== "all" && p.day !== day) return false;
      if (onlyFav && !selectedIds.has(p.id)) return false;
      if ([...features].some((f) => !p.features.includes(f))) return false;
      if (kinds.size && !kinds.has(p.kind)) return false;
      const m = toMinutes(p.start);
      if (parts.size && !PARTS.some((pt) => parts.has(pt.id) && pt.test(m))) return false;
      if (words.length) {
        const hay = fold(
          [
            p.title,
            p.area ?? "",
            DISTRICTS[p.district].name,
            p.leaders.map((l) => `${l.name} ${l.role ?? ""}`).join(" "),
            p.description.join(" "),
          ].join(" "),
        );
        if (!words.every((w) => hay.includes(w))) return false;
      }
      return true;
    }).sort((a, b) => a.day.localeCompare(b.day) || toMinutes(a.start) - toMinutes(b.start));
  }, [day, onlyFav, selectedIds, features, kinds, parts, q]);

  // day -> start time -> programs
  const groups = useMemo(() => {
    const out: { day: Day; slots: { time: string; items: typeof visible }[] }[] = [];
    for (const p of visible) {
      let g = out.find((x) => x.day === p.day);
      if (!g) out.push((g = { day: p.day, slots: [] }));
      let s = g.slots.find((x) => x.time === p.start);
      if (!s) g.slots.push((s = { time: p.start, items: [] }));
      s.items.push(p);
    }
    return out;
  }, [visible]);

  const activeFilters = features.size + kinds.size + parts.size + (onlyFav ? 1 : 0) + (q ? 1 : 0);

  return (
    <div className="pt-4">
      <section className="rounded-3xl bg-ff-leaf-soft px-5 py-5 sm:px-7">
        <h1 className="font-ff-display text-3xl leading-tight font-bold text-ff-ink sm:text-4xl">
          Fától fáig a fővárosban
        </h1>
        <p className="mt-1 max-w-2xl text-ff-muted">
          2026. október 15–17. · vezetett séták, beszélgetések és bemutatók Budapest-szerte. A programok ingyenesek, de
          regisztrációhoz kötöttek.
        </p>
        <a
          href={REGISTRATION_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-full bg-ff-mauve px-5 py-2.5 font-ff-display text-lg font-semibold tracking-wide text-white uppercase hover:opacity-90"
        >
          Regisztráció
          <ArrowRight size={ICON.md} weight="bold" aria-hidden />
        </a>
      </section>

      <div className="mt-5 flex gap-1 overflow-x-auto [scrollbar-width:none]">
        {([{ id: "all", label: "Mind", weekday: "3 nap" }, ...DAYS] as const).map((d) => {
          const on = day === d.id;
          const color = d.id === "all" ? "var(--ff-olive)" : DAY_COLOR[d.id];
          return (
            <button
              key={d.id}
              onClick={() => setPicked(d.id)}
              aria-pressed={on}
              className={`min-h-12 shrink-0 rounded-2xl px-3 py-2 text-left sm:px-4 transition-colors ${on ? "text-white" : "text-ff-ink hover:bg-ff-olive/10"}`}
              style={on ? { background: color } : undefined}
            >
              <span className="block font-ff-display text-lg leading-none font-bold sm:text-xl">{d.label}</span>
              {d.weekday && (
                <span className={`text-xs font-semibold ${on ? "text-white/85" : "text-ff-muted"}`}>{d.weekday}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 space-y-2.5">
        <label htmlFor="ff-search" className="sr-only">
          Keresés a programban
        </label>
        <div className="relative">
          <MagnifyingGlass
            size={ICON.md}
            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ff-muted"
            aria-hidden
          />
          <input
            id="ff-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Keresés: helyszín, sétavezető, téma… (pl. Margitsziget, platán)"
            className="w-full rounded-2xl border border-transparent bg-white py-3 pr-4 pl-11 shadow-[0_1px_2px_rgba(47,51,36,0.06)] ring-1 ring-ff-olive/10 outline-none placeholder:text-ff-muted/70 focus:ring-2 focus:ring-ff-olive/40"
          />
        </div>
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          aria-expanded={filtersOpen}
          aria-controls="ff-filters"
          className={`inline-flex min-h-10 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold sm:hidden ${filtersOpen ? "bg-ff-olive text-white" : "bg-ff-olive/8 text-ff-olive"}`}
        >
          {filtersOpen ? (
            <CaretDown size={ICON.sm} weight="bold" aria-hidden />
          ) : (
            <CaretRight size={ICON.sm} weight="bold" aria-hidden />
          )}
          Szűrők{activeFilters - (q ? 1 : 0) > 0 ? ` (${activeFilters - (q ? 1 : 0)})` : ""}
        </button>
        <div id="ff-filters" className={`${filtersOpen ? "block" : "hidden"} space-y-2.5 sm:block`}>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(FEATURES) as Feature[]).map((f) => (
              <Chip key={f} on={features.has(f)} onClick={() => toggleIn(features, f, setFeatures)}>
                {(() => {
                  const Icon = FEATURE_ICON[f];
                  return <Icon size={ICON.md} aria-hidden />;
                })()}
                {f === "tomegkozlekedes" ? "Tömegközlekedéssel" : FEATURES[f].label}
              </Chip>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {PARTS.map((pt) => (
              <Chip key={pt.id} on={parts.has(pt.id)} onClick={() => toggleIn(parts, pt.id, setParts)}>
                {pt.label}
              </Chip>
            ))}
            <span className="mx-1 self-center text-ff-olive/30">|</span>
            {(Object.keys(KINDS) as Kind[]).map((k) => (
              <Chip key={k} on={kinds.has(k)} onClick={() => toggleIn(kinds, k, setKinds)}>
                {KINDS[k]}
              </Chip>
            ))}
            <span className="mx-1 self-center text-ff-olive/30">|</span>
            <Chip on={onlyFav} onClick={() => setOnlyFav(!onlyFav)} color="var(--ff-mauve)">
              <Star size={ICON.sm + 2} weight={onlyFav ? "fill" : "regular"} aria-hidden />
              Csak a kedvenceim
            </Chip>
            {activeFilters > 0 && (
              <button
                onClick={() => {
                  setFeatures(new Set());
                  setKinds(new Set());
                  setParts(new Set());
                  setOnlyFav(false);
                  setQ("");
                }}
                className="min-h-10 px-2 text-sm text-ff-muted underline hover:text-ff-ink"
              >
                szűrők törlése
              </button>
            )}
          </div>
        </div>
      </div>

      {groups.length === 0 && (
        <p className="mt-10 rounded-2xl bg-white p-6 text-center text-ff-muted ring-1 ring-ff-olive/10">
          Nincs a szűrőknek megfelelő program. Próbálj kevesebb szűrőt, vagy válts napot.
        </p>
      )}

      {groups.map((g) => (
        <section key={g.day} className="mt-8">
          {day === "all" && (
            <h2 className="mb-3 flex items-baseline gap-2 font-ff-display text-2xl font-bold">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ background: DAY_COLOR[g.day] }}
                aria-hidden
              />
              {DAYS.find((d) => d.id === g.day)!.label}{" "}
              <span className="text-lg font-semibold text-ff-muted">{DAYS.find((d) => d.id === g.day)!.weekday}</span>
            </h2>
          )}
          {g.day === "2026-10-15" && (
            <p className="mb-4 flex items-start gap-2 rounded-2xl bg-ff-leaf-soft px-4 py-3 text-sm text-ff-ink">
              <Plant size={ICON.md} className="mt-px shrink-0 text-ff-olive" aria-hidden />
              Napközben önkéntes akciók, ahol a résztvevők azt is megtanulhatják, hogyan érdemes kezelni a városi zöldet
              – a részletek hamarosan érkeznek.
            </p>
          )}
          <div className="space-y-5">
            {g.slots.map((s) => (
              <div key={s.time} className="grid gap-3 sm:grid-cols-[64px_1fr]">
                <div className="font-ff-display text-2xl leading-none font-bold text-ff-olive sm:pt-4">{s.time}</div>
                <div className="grid gap-3 md:grid-cols-2">
                  {s.items.map((p) => (
                    <ProgramCard key={p.id} p={p} conflict={conflicts.has(p.id)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
