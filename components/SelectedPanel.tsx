"use client";

import type { Program } from "@/lib/types";
import { formatDay, formatTime } from "@/lib/schedule";

type Props = {
  programs: Program[];
  conflictIds: Set<number>;
  onOpenProgram: (id: number) => void;
};

export function SelectedPanel({ programs, conflictIds, onOpenProgram }: Props) {
  if (programs.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="max-w-sm text-center font-body text-ink/50">
          Még nincs kiválasztott program. Válts a Rács fülre, és kattints egy
          programra a hozzáadáshoz.
        </p>
      </div>
    );
  }

  const byDay = new Map<string, Program[]>();
  for (const p of programs) {
    const list = byDay.get(p.day) ?? [];
    list.push(p);
    byDay.set(p.day, list);
  }

  const conflictCount = programs.filter((p) => conflictIds.has(p.id)).length;

  return (
    <div className="mx-auto h-full max-w-3xl overflow-y-auto px-4 py-6">
      {conflictCount > 0 && (
        <p className="mb-4 rounded border border-danger/30 bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
          {conflictCount} kiválasztott program időben ütközik egy másikkal.
        </p>
      )}
      <div className="space-y-6">
        {[...byDay.entries()].map(([day, dayPrograms]) => (
          <div key={day}>
            <h3 className="mb-2 font-mono text-xs uppercase tracking-wide text-ink/40">
              {formatDay(day)}
            </h3>
            <ul className="divide-y divide-line">
              {dayPrograms.map((p) => {
                const isConflict = conflictIds.has(p.id);
                return (
                  <li key={p.id}>
                    <button
                      onClick={() => onOpenProgram(p.id)}
                      className={`flex w-full items-start gap-3 py-2.5 text-left ${
                        isConflict ? "border-l-2 border-danger pl-2" : ""
                      }`}
                    >
                      <div className="min-w-0">
                        <div
                          className={`font-mono text-xs ${isConflict ? "text-danger" : "text-ink/50"}`}
                        >
                          {formatTime(p.startTs)}–{formatTime(p.endTs)}
                          {p.location ? ` · ${p.location.name}` : ""}
                        </div>
                        <div className="truncate font-medium text-ink">
                          {p.name}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
