"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFfFavorites } from "@/lib/fafesztival/favorites";
import { ICON, List, Star, X } from "./icons";

const LINKS = [
  { href: "/fafesztival", label: "Kezdőlap" },
  { href: "/fafesztival/program", label: "Program" },
  { href: "/fafesztival/terkep", label: "Térkép" },
];
const FAVORITES = "/fafesztival/kedvenceim";

// Below 420px (logo 84 + gap 16 + nav ~283 + 2×16 padding ≈ 415) the logo and
// the inline nav no longer fit on one row, so
// the page links collapse into a hamburger menu (the favourites star stays
// visible next to it). Keep the two `min-[420px]:` classes below in sync.
const isActive = (pathname: string, href: string) =>
  href === "/fafesztival" ? pathname === href : pathname.startsWith(href);

function FavoritesStar({ pathname, count }: { pathname: string; count: number }) {
  const active = isActive(pathname, FAVORITES);
  return (
    <Link
      href={FAVORITES}
      aria-label={count > 0 ? `Kedvenceim (${count})` : "Kedvenceim"}
      aria-current={active ? "page" : undefined}
      className={`relative inline-flex h-10 w-11 shrink-0 items-center justify-center transition-colors ${
        active ? "bg-ff-olive text-white" : "text-ff-olive hover:bg-ff-olive/10"
      }`}
    >
      <Star size={ICON.lg} weight={count > 0 ? "fill" : "bold"} aria-hidden />
      {count > 0 && (
        <span
          aria-hidden
          className={`absolute top-0.5 right-0.5 min-w-4 px-0.5 text-center font-ff-body text-[11px] leading-4 font-bold ${
            active ? "bg-white text-ff-olive" : "bg-ff-mauve text-white"
          }`}
        >
          {count}
        </span>
      )}
    </Link>
  );
}

export function FfNav() {
  const pathname = usePathname();
  const { selectedIds } = useFfFavorites();
  // The menu belongs to the page it was opened on: navigating closes it
  // without an effect, because a different pathname no longer matches.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const close = () => setOpenOn(null);

  return (
    <nav aria-label="Fafesztivál" className="font-ff-display font-semibold tracking-wide uppercase">
      <div className="flex items-center gap-0.5 bg-ff-olive/10 p-1 text-[15px]">
        <ul className="hidden gap-0.5 min-[420px]:flex">
          {LINKS.map((l) => {
            const active = isActive(pathname, l.href);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex min-h-10 items-center px-3 py-1 whitespace-nowrap transition-colors sm:px-4 ${
                    active ? "bg-ff-olive text-white" : "text-ff-olive hover:bg-ff-olive/10"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <FavoritesStar pathname={pathname} count={selectedIds.size} />
        <button
          type="button"
          onClick={() => setOpenOn(open ? null : pathname)}
          aria-expanded={open}
          aria-controls="ff-menu"
          aria-label={open ? "Menü bezárása" : "Menü"}
          className="inline-flex h-10 w-11 items-center justify-center text-ff-olive hover:bg-ff-olive/10 min-[420px]:hidden"
        >
          {open ? <X size={ICON.lg} weight="bold" aria-hidden /> : <List size={ICON.lg} weight="bold" aria-hidden />}
        </button>
      </div>

      {open && (
        // Positioned against the sticky <header> (the nearest positioned
        // ancestor), so it drops down full-width right under the header row.
        <div
          id="ff-menu"
          onKeyDown={(e) => e.key === "Escape" && close()}
          className="absolute inset-x-0 top-full border-y border-ff-olive/15 bg-ff-bg min-[420px]:hidden"
        >
          <ul className="mx-auto max-w-5xl px-4 py-2 text-xl">
            {[...LINKS, { href: FAVORITES, label: "Kedvenceim" }].map((l) => {
              const active = isActive(pathname, l.href);
              return (
                <li key={l.href} className="border-b border-ff-olive/10 last:border-b-0">
                  <Link
                    href={l.href}
                    onClick={close}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-12 items-center gap-2 px-2 ${
                      active ? "text-ff-ink" : "text-ff-olive hover:bg-ff-olive/10"
                    }`}
                  >
                    {active && <span aria-hidden className="h-5 w-1 bg-ff-olive" />}
                    {l.label}
                    {l.href === FAVORITES && selectedIds.size > 0 && (
                      <span className="text-ff-muted">({selectedIds.size})</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </nav>
  );
}
