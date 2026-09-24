"use client";

import { formatDay, formatWeekdayInitial } from "@/lib/schedule";

type Props = {
  days: string[];
  selectedDay: string;
  onSelect: (day: string) => void;
};

export function DateTabs({ days, selectedDay, onSelect }: Props) {
  return (
    <div className="flex gap-1 overflow-x-auto [scrollbar-width:none]">
      {days.map((day) => {
        const active = day === selectedDay;
        return (
          <button
            key={day}
            onClick={() => onSelect(day)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 font-mono text-sm transition-colors ${
              active
                ? "bg-ink text-paper"
                : "text-ink/70 hover:bg-ink/5 hover:text-ink"
            }`}
          >
            {formatDay(day)} {formatWeekdayInitial(day)}
          </button>
        );
      })}
    </div>
  );
}
