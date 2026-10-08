"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFfFavorites } from "@/lib/fafesztival/favorites";

const LINKS = [
  { href: "/fafesztival", label: "Kezdőlap" },
  { href: "/fafesztival/program", label: "Program" },
  { href: "/fafesztival/terkep", label: "Térkép" },
  { href: "/fafesztival/kedvenceim", label: "Kedvenceim" },
];

export function FfNav() {
  const pathname = usePathname();
  const { selectedIds } = useFfFavorites();
  return (
    <nav
      aria-label="Fafesztivál"
      className="flex gap-0.5 bg-ff-olive/10 p-1 text-[15px] font-ff-display font-semibold tracking-wide uppercase"
    >
      {LINKS.map((l) => {
        const active = l.href === "/fafesztival" ? pathname === l.href : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`inline-flex min-h-10 items-center px-3 py-1 whitespace-nowrap transition-colors sm:px-4 ${
              active ? "bg-ff-olive text-white" : "text-ff-olive hover:bg-ff-olive/10"
            }`}
          >
            {l.label}
            {l.href.endsWith("kedvenceim") && selectedIds.size > 0 ? ` (${selectedIds.size})` : ""}
          </Link>
        );
      })}
    </nav>
  );
}
