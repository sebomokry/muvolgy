"use client";

import { useFfFavorites } from "@/lib/fafesztival/favorites";
import { ICON, Star } from "./icons";

export function FavoriteButton({ id, title, size = "sm" }: { id: number; title?: string; size?: "sm" | "lg" }) {
  const { selectedIds, toggle } = useFfFavorites();
  const on = selectedIds.has(id);
  if (size === "lg") {
    return (
      <button
        onClick={() => toggle(id)}
        aria-pressed={on}
        className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-5 py-3 font-ff-display text-lg font-semibold tracking-wide uppercase transition-colors ${
          on
            ? "bg-ff-mauve-soft text-ff-mauve hover:bg-ff-mauve/15"
            : "bg-ff-olive/10 text-ff-olive hover:bg-ff-olive/15"
        }`}
      >
        <Star size={ICON.lg} weight={on ? "fill" : "regular"} aria-hidden />
        {on ? "Benne van a kedvenceimben" : "Hozzáadás a kedvenceimhez"}
      </button>
    );
  }
  // Constant accessible name + aria-pressed, so screen readers announce the
  // state instead of a label that flips between "add" and "remove".
  return (
    <button
      onClick={() => toggle(id)}
      aria-label={title ? `Kedvenc: ${title}` : "Kedvenc"}
      aria-pressed={on}
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors ${
        on ? "bg-ff-mauve text-white" : "bg-ff-olive/10 text-ff-olive hover:bg-ff-olive/20"
      }`}
    >
      <Star size={ICON.md + 2} weight={on ? "fill" : "regular"} aria-hidden />
    </button>
  );
}
