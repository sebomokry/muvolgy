"use client";

import { useFfFavorites } from "@/lib/fafesztival/favorites";

export function FavoriteButton({ id, size = "sm" }: { id: number; size?: "sm" | "lg" }) {
  const { selectedIds, toggle } = useFfFavorites();
  const on = selectedIds.has(id);
  if (size === "lg") {
    return (
      <button
        onClick={() => toggle(id)}
        className={`flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 font-ff-display text-lg font-semibold tracking-wide uppercase transition-colors ${
          on
            ? "bg-ff-mauve-soft text-ff-mauve hover:bg-ff-mauve/15"
            : "bg-ff-olive/10 text-ff-olive hover:bg-ff-olive/15"
        }`}
      >
        {on ? "★ Benne van a kedvenceimben" : "☆ Hozzáadás a kedvenceimhez"}
      </button>
    );
  }
  return (
    <button
      onClick={() => toggle(id)}
      aria-label={on ? "Eltávolítás a kedvencek közül" : "Hozzáadás a kedvencekhez"}
      aria-pressed={on}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xl transition-colors ${
        on ? "bg-ff-mauve text-white" : "bg-ff-olive/10 text-ff-olive hover:bg-ff-olive/20"
      }`}
    >
      {on ? "★" : "☆"}
    </button>
  );
}
