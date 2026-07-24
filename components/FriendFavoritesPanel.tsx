"use client";

import { useCallback, useState } from "react";
import type { Program } from "@/lib/types";
import type { FriendFavorite } from "@/hooks/useFriendFavorites";
import { useImportRequest } from "@/hooks/useImportRequest";
import { formatDay, formatTime, formatWeekday } from "@/lib/schedule";
import { settlementColor } from "@/lib/settlementColors";
import { FriendQrScanner } from "./FriendQrScanner";

type Props = {
  friends: FriendFavorite[];
  allPrograms: Program[];
  onRemoveFriend: (name: string) => void;
  onShare: () => void;
  onOpenProgram: (id: number) => void;
  hasOwnFavorites: boolean;
};

export function FriendFavoritesPanel({
  friends,
  allPrograms,
  onRemoveFriend,
  onShare,
  onOpenProgram,
  hasOwnFavorites,
}: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const { importRequest, setRequestFromUrl } = useImportRequest();
  const [pastedLink, setPastedLink] = useState("");
  const [pasteError, setPasteError] = useState(false);

  // Scanning pauses while a confirm dialog (ImportFriendFavoritesModal) is
  // already pending, whether that came from the camera or the paste field —
  // resumes automatically the instant it clears (Hozzáadás/Mégse both do).
  const scannerActive = importRequest === null;

  const handleDecoded = useCallback(
    (rawText: string) => {
      setRequestFromUrl(rawText);
    },
    [setRequestFromUrl],
  );

  const handlePaste = () => {
    if (setRequestFromUrl(pastedLink.trim())) {
      setPasteError(false);
      setPastedLink("");
    } else {
      setPasteError(true);
    }
  };

  const toggleExpanded = (name: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  return (
    <div className="mx-auto h-full max-w-3xl overflow-y-auto px-4 py-6">
      <div className="mb-6">
        <h3 className="mb-2 font-display text-sm font-medium text-ink">
          QR-kód beolvasása
        </h3>
        <FriendQrScanner active={scannerActive} onDecoded={handleDecoded} />

        <div className="mt-3">
          <p className="text-sm text-ink/70">Vagy illeszd be a kapott linket:</p>
          <input
            value={pastedLink}
            onChange={(e) => {
              setPastedLink(e.target.value);
              setPasteError(false);
            }}
            placeholder="https://..."
            className="mt-2 w-full rounded border border-line bg-paper px-3 py-2 font-mono text-sm text-ink placeholder:text-ink/40 focus:border-accent focus:outline-none"
          />
          {pasteError && (
            <p className="mt-2 text-xs text-danger">
              Ez nem egy érvényes megosztási link.
            </p>
          )}
          <button
            onClick={handlePaste}
            disabled={pastedLink.trim().length === 0}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded bg-accent px-4 py-2 font-display text-sm font-medium text-paper transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            Beolvasás
          </button>
        </div>
      </div>

      <div className="mb-6 border-t border-line pt-6">
        <button
          onClick={onShare}
          disabled={!hasOwnFavorites}
          className="flex w-full items-center justify-center gap-2 rounded bg-accent px-4 py-2 font-display text-sm font-medium text-paper transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          Megosztás QR-kóddal
        </button>
        {!hasOwnFavorites && (
          <p className="mt-2 text-center text-xs text-ink/70">
            Válassz ki legalább egy programot a Saját fülön a megosztáshoz.
          </p>
        )}
      </div>

      {friends.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className="max-w-sm text-center font-body text-ink/70">
            Még senki kedvenceit nem adtad hozzá — kérj tőle egy QR-kódot!
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {friends.map((friend) => {
            const isOpen = expanded.has(friend.name);
            const friendPrograms = allPrograms.filter((p) =>
              friend.programIds.includes(p.id),
            );
            const byDay = new Map<string, Program[]>();
            for (const p of friendPrograms) {
              const list = byDay.get(p.day) ?? [];
              list.push(p);
              byDay.set(p.day, list);
            }

            return (
              <li key={friend.name} className="py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => toggleExpanded(friend.name)}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <span className="text-xs text-ink/70">
                      {isOpen ? "▾" : "▸"}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-ink">
                        {friend.name}
                      </span>
                      <span className="block font-mono text-xs text-ink/70">
                        {friend.programIds.length} program
                      </span>
                    </span>
                  </button>
                  <button
                    onClick={() => onRemoveFriend(friend.name)}
                    aria-label={`${friend.name} eltávolítása`}
                    className="shrink-0 rounded border border-line px-3 py-1.5 font-display text-xs font-medium text-ink transition-colors hover:bg-ink/5"
                  >
                    Eltávolítás
                  </button>
                </div>

                {isOpen && (
                  <div className="mt-3 space-y-4 pl-5">
                    {[...byDay.entries()].map(([day, dayPrograms]) => (
                      <div key={day}>
                        <h4 className="mb-1.5 font-mono text-xs uppercase tracking-wide text-ink/70">
                          {formatDay(day)} ({formatWeekday(day)})
                        </h4>
                        <ul className="divide-y divide-line">
                          {dayPrograms.map((p) => (
                            <li key={p.id}>
                              <button
                                onClick={() => onOpenProgram(p.id)}
                                className="flex w-full items-start justify-between gap-3 py-2 text-left"
                              >
                                <div className="min-w-0">
                                  <div className="font-mono text-xs text-ink/70">
                                    {formatTime(p.startTs)}–
                                    {formatTime(p.endTs)}
                                    {p.location ? ` · ${p.location.name}` : ""}
                                  </div>
                                  <div className="truncate font-medium text-ink">
                                    {p.name}
                                  </div>
                                </div>
                                {p.location?.city && (
                                  <span
                                    className="mt-1 h-3.5 w-3.5 shrink-0 rounded-full"
                                    style={{
                                      backgroundColor: settlementColor(
                                        p.location.city,
                                      ).solid,
                                    }}
                                    aria-hidden="true"
                                  />
                                )}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
