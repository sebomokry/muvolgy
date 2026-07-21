"use client";

import { settlementColor } from "@/lib/settlementColors";

type Props = {
  settlements: string[];
  activeSettlements: Set<string>;
  onToggle: (settlement: string) => void;
  onAll: () => void;
  onNone: () => void;
};

export function SettlementFilter({
  settlements,
  activeSettlements,
  onToggle,
  onAll,
  onNone,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {settlements.map((settlement) => {
        const active = activeSettlements.has(settlement);
        const color = settlementColor(settlement).solid;
        return (
          <button
            key={settlement}
            onClick={() => onToggle(settlement)}
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
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
            {settlement}
          </button>
        );
      })}
      <div className="ml-1 flex gap-1.5 font-mono text-xs text-ink/40">
        <button onClick={onAll} className="underline hover:text-ink">
          mind
        </button>
        <span>·</span>
        <button onClick={onNone} className="underline hover:text-ink">
          egyik sem
        </button>
      </div>
    </div>
  );
}
