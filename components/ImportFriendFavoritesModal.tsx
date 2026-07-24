"use client";

import type { Program } from "@/lib/types";
import { useImportRequest } from "@/hooks/useImportRequest";
import { useFriendFavorites } from "@/hooks/useFriendFavorites";

type Props = {
  programs: Program[];
};

export function ImportFriendFavoritesModal({ programs }: Props) {
  const { importRequest, clearRequest } = useImportRequest();
  const { addFriend } = useFriendFavorites();

  if (!importRequest) return null;

  const validIds = importRequest.ids.filter((id) =>
    programs.some((p) => p.id === id),
  );

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-ink/40 p-4"
      onClick={clearRequest}
    >
      <div
        className="w-full max-w-sm rounded border border-line bg-paper p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {validIds.length > 0 ? (
          <>
            <h2 className="font-display text-lg font-medium text-ink">
              Megosztott kedvencek
            </h2>
            <p className="mt-3 text-sm text-ink/70">
              <strong className="text-ink">{importRequest.name}</strong>{" "}
              szeretné megosztani veled {validIds.length} kedvenc programját.
              Hozzáadod a listádhoz?
            </p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={clearRequest}
                className="flex-1 rounded border border-line px-4 py-2 font-display text-sm font-medium text-ink transition-colors hover:bg-ink/5"
              >
                Mégse
              </button>
              <button
                onClick={() => {
                  addFriend(importRequest.name, validIds);
                  clearRequest();
                }}
                className="flex-1 rounded bg-accent px-4 py-2 font-display text-sm font-medium text-paper transition-opacity hover:opacity-90"
              >
                Hozzáadás
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="font-display text-lg font-medium text-ink">
              Nem sikerült beolvasni
            </h2>
            <p className="mt-3 text-sm text-ink/70">
              A megosztott programok közül egyik sem található a jelenlegi
              adatok között.
            </p>
            <button
              onClick={clearRequest}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded bg-accent px-4 py-2 font-display text-sm font-medium text-paper transition-opacity hover:opacity-90"
            >
              Rendben
            </button>
          </>
        )}
      </div>
    </div>
  );
}
