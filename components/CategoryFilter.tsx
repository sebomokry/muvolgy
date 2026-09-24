"use client";

import type { Category } from "@/lib/types";
import { categoryColor } from "@/lib/categoryColors";

type Props = {
  categories: Category[];
  activeIds: Set<number>;
  onToggle: (id: number) => void;
  onAll: () => void;
  onNone: () => void;
  disabled?: boolean;
};

export function CategoryFilter({
  categories,
  activeIds,
  onToggle,
  onAll,
  onNone,
  disabled = false,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {categories.map((c) => {
        const active = activeIds.has(c.id);
        const color = categoryColor(c.name);
        return (
          <button
            key={c.id}
            onClick={() => onToggle(c.id)}
            disabled={disabled}
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
              disabled ? "opacity-40" : ""
            } ${
              active
                ? "border-transparent text-paper"
                : "border-transparent bg-ink/5 text-ink/70 hover:bg-ink/10 hover:text-ink"
            }`}
            style={active ? { backgroundColor: color } : undefined}
          >
            <span
              className={`h-2 w-2 rounded-full ${active ? "bg-paper" : ""}`}
              style={active ? undefined : { backgroundColor: color }}
            />
            {c.name}
          </button>
        );
      })}
      <div
        className={`ml-1 flex gap-1.5 font-mono text-xs text-ink/40 ${disabled ? "opacity-40" : ""}`}
      >
        <button
          onClick={onAll}
          disabled={disabled}
          className="underline hover:text-ink"
        >
          mind
        </button>
        <span>·</span>
        <button
          onClick={onNone}
          disabled={disabled}
          className="underline hover:text-ink"
        >
          egyik sem
        </button>
      </div>
    </div>
  );
}
