"use client";

import type { Program } from "@/lib/types";
import { formatDay, formatTime, formatWeekday } from "@/lib/schedule";
import { settlementColor } from "@/lib/settlementColors";
import { InfoFooter } from "./InfoFooter";

type Props = {
  programs: Program[];
  conflictIds: Set<number>;
  onOpenProgram: (id: number) => void;
  onOpenInfo: () => void;
};

export function SelectedPanel({
  programs,
  conflictIds,
  onOpenProgram,
  onOpenInfo,
}: Props) {
  if (programs.length === 0) {
    return (
      <div className="mx-auto flex h-full max-w-3xl flex-col overflow-y-auto px-4 py-6">
        <div className="flex flex-1 items-center justify-center">
          <p className="max-w-sm text-center font-body text-ink/70">
            Még nincs kiválasztott program. Válts a Programtábla fülre, és
            kattints egy programra a hozzáadáshoz.
          </p>
        </div>
        <InfoFooter onOpenInfo={onOpenInfo} />
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
            <h3 className="mb-2 font-mono text-xs uppercase tracking-wide text-ink/70">
              {formatDay(day)} ({formatWeekday(day)})
            </h3>
            <ul className="divide-y divide-line">
              {dayPrograms.map((p) => {
                const isConflict = conflictIds.has(p.id);
                return (
                  <li key={p.id}>
                    <button
                      onClick={() => onOpenProgram(p.id)}
                      className={`flex w-full items-start justify-between gap-3 py-2.5 text-left ${
                        isConflict ? "border-l-2 border-danger pl-2" : ""
                      }`}
                    >
                      <div className="min-w-0">
                        <div
                          className={`font-mono text-xs ${isConflict ? "text-danger" : "text-ink/70"}`}
                        >
                          {formatTime(p.startTs)}–{formatTime(p.endTs)}
                          {p.location ? ` · ${p.location.name}` : ""}
                        </div>
                        <div className="truncate font-medium text-ink">
                          {p.name}
                        </div>
                      </div>
                      {p.location?.city && (
                        <span
                          className="mt-1 h-3.5 w-3.5 shrink-0 full"
                          style={{
                            backgroundColor: settlementColor(p.location.city)
                              .solid,
                          }}
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <InfoFooter onOpenInfo={onOpenInfo} />
    </div>
  );
}
