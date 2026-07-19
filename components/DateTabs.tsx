"use client";

import { formatDay } from "@/lib/schedule";

type Props = {
  days: string[];
  selectedDay: string;
  onSelect: (day: string) => void;
};

export function DateTabs({ days, selectedDay, onSelect }: Props) {
  return (
    <div className="flex gap-1.5 overflow-x-auto">
      {days.map((day) => {
        const active = day === selectedDay;
        return (
          <button
            key={day}
            onClick={() => onSelect(day)}
            className={`shrink-0 rounded px-3 py-1 font-mono text-sm transition-colors ${
              active
                ? "bg-ink text-paper"
                : "text-ink/60 hover:bg-ink/5 hover:text-ink"
            }`}
          >
            {formatDay(day)}
          </button>
        );
      })}
    </div>
  );
}
