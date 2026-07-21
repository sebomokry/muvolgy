"use client";

import type { Category } from "@/lib/types";
import { categoryColor } from "@/lib/categoryColors";

type Props = {
  categories: Category[];
  activeIds: Set<number>;
  onToggle: (id: number) => void;
  onAll: () => void;
  onNone: () => void;
  extraChip?: { label: string; active: boolean; onClick: () => void };
};

export function CategoryFilter({
  categories,
  activeIds,
  onToggle,
  onAll,
  onNone,
  extraChip,
}: Props) {
  const overridden = extraChip?.active ?? false;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {categories.map((c) => {
        const active = activeIds.has(c.id);
        const color = categoryColor(c.name);
        return (
          <button
            key={c.id}
            onClick={() => onToggle(c.id)}
            disabled={overridden}
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
              overridden ? "opacity-40" : ""
            } ${
              active
                ? "border-transparent text-paper"
                : "border-line text-ink/50 hover:text-ink"
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
        className={`ml-1 flex gap-1.5 font-mono text-xs text-ink/40 ${overridden ? "opacity-40" : ""}`}
      >
        <button
          onClick={onAll}
          disabled={overridden}
          className="underline hover:text-ink"
        >
          mind
        </button>
        <span>·</span>
        <button
          onClick={onNone}
          disabled={overridden}
          className="underline hover:text-ink"
        >
          egyik sem
        </button>
      </div>
      {extraChip && (
        <button
          onClick={extraChip.onClick}
          className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
            extraChip.active
              ? "border-transparent text-paper"
              : "border-line text-ink/50 hover:text-ink"
          }`}
          style={extraChip.active ? { backgroundColor: "var(--pin)" } : undefined}
        >
          <span
            className={`h-2 w-2 rounded-full ${extraChip.active ? "bg-paper" : ""}`}
            style={extraChip.active ? undefined : { backgroundColor: "var(--pin)" }}
          />
          {extraChip.label}
        </button>
      )}
    </div>
  );
}
