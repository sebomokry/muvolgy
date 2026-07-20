"use client";

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
        return (
          <button
            key={settlement}
            onClick={() => onToggle(settlement)}
            className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
              active
                ? "border-transparent bg-accent text-paper"
                : "border-line text-ink/50 hover:text-ink"
            }`}
          >
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
