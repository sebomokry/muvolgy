"use client";

import type { Program } from "@/lib/types";
import { formatDay, formatTime, formatWeekday } from "@/lib/schedule";
import { settlementColor } from "@/lib/settlementColors";

type Props = {
  programs: Program[];
  conflictIds: Set<number>;
  onOpenProgram: (id: number) => void;
  onExport: () => void;
  onImport: () => void;
  canExport: boolean;
};

export function SelectedPanel({
  programs,
  conflictIds,
  onOpenProgram,
  onExport,
  onImport,
  canExport,
}: Props) {
  const actionButtons = (
    <div className="mb-6 flex gap-2">
      <button
        onClick={onExport}
        disabled={!canExport}
        className="flex-1 rounded bg-accent px-4 py-2 font-display text-sm font-medium text-paper transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        Exportálás QR-kóddal
      </button>
      <button
        onClick={onImport}
        className="flex-1 rounded border border-line px-4 py-2 font-display text-sm font-medium text-ink transition-colors hover:bg-ink/5"
      >
        Importálás
      </button>
    </div>
  );

  if (programs.length === 0) {
    return (
      <div className="mx-auto h-full max-w-3xl overflow-y-auto px-4 py-6">
        {actionButtons}
        <div className="flex items-center justify-center py-12">
          <p className="max-w-sm text-center font-body text-ink/70">
            Még nincs kiválasztott program. Válts a Programtábla fülre, és
            kattints egy programra a hozzáadáshoz.
          </p>
        </div>
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
      {actionButtons}
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
    </div>
  );
}
