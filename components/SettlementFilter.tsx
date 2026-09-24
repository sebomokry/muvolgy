"use client";

import { settlementColor } from "@/lib/settlementColors";

type Props = {
  settlements: string[];
  activeSettlements: Set<string>;
  onToggle: (settlement: string) => void;
};

export function SettlementFilter({
  settlements,
  activeSettlements,
  onToggle,
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
                : "border-transparent bg-ink/5 text-ink/70 hover:bg-ink/10 hover:text-ink"
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
    </div>
  );
}
