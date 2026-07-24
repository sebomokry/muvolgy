"use client";

import { useState } from "react";
import type { Location, Program } from "@/lib/types";
import { useOwnImportRequest } from "@/hooks/useOwnImportRequest";
import { useSelectedPrograms } from "@/hooks/useSelectedPrograms";
import { useFavoriteVenues } from "@/hooks/useFavoriteVenues";

type Props = {
  programs: Program[];
  locations: Location[];
  manualOpen: boolean;
  onCloseManual: () => void;
};

export function ImportOwnFavoritesModal({
  programs,
  locations,
  manualOpen,
  onCloseManual,
}: Props) {
  const { importRequest, clearRequest, setRequestFromUrl } =
    useOwnImportRequest();
  const { addMany: addPrograms } = useSelectedPrograms();
  const { addMany: addVenues } = useFavoriteVenues();
  const [pastedLink, setPastedLink] = useState("");
  const [pasteError, setPasteError] = useState(false);

  const close = () => {
    clearRequest();
    setPastedLink("");
    setPasteError(false);
    onCloseManual();
  };

  const handlePaste = () => {
    if (setRequestFromUrl(pastedLink.trim())) {
      setPasteError(false);
    } else {
      setPasteError(true);
    }
  };

  if (importRequest) {
    const validProgramIds = importRequest.programIds.filter((id) =>
      programs.some((p) => p.id === id),
    );
    const validVenueIds = importRequest.venueIds.filter((id) =>
      locations.some((l) => l.id === id),
    );
    const hasAny = validProgramIds.length > 0 || validVenueIds.length > 0;

    return (
      <div
        className="fixed inset-0 z-30 flex items-center justify-center bg-ink/40 p-4"
        onClick={close}
      >
        <div
          className="w-full max-w-sm rounded border border-line bg-paper p-5 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {hasAny ? (
            <>
              <h2 className="font-display text-lg font-medium text-ink">
                Kedvenceim importálása
              </h2>
              <p className="mt-3 text-sm text-ink/70">
                Ez a link {validProgramIds.length} programot és{" "}
                {validVenueIds.length} helyszínt tartalmaz. Hozzáadod a
                jelenlegi kedvenceidhez?
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={close}
                  className="flex-1 rounded border border-line px-4 py-2 font-display text-sm font-medium text-ink transition-colors hover:bg-ink/5"
                >
                  Mégse
                </button>
                <button
                  onClick={() => {
                    if (validProgramIds.length > 0) addPrograms(validProgramIds);
                    if (validVenueIds.length > 0) addVenues(validVenueIds);
                    close();
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
                A linkben szereplő programok és helyszínek közül egyik sem
                található a jelenlegi adatok között.
              </p>
              <button
                onClick={close}
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

  if (!manualOpen) return null;

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-ink/40 p-4"
      onClick={close}
    >
      <div
        className="w-full max-w-sm rounded border border-line bg-paper p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-lg font-medium text-ink">
            Kedvenceim importálása
          </h2>
          <button
            onClick={close}
            className="shrink-0 font-mono text-ink/70 hover:text-ink"
            aria-label="Bezárás"
          >
            ✕
          </button>
        </div>
        <p className="mt-3 text-sm text-ink/70">
          Illeszd be az &bdquo;Exportálás&rdquo;-nál kapott linket, hogy
          átvidd a kedvenceidet egy másik böngészőből.
        </p>
        <input
          value={pastedLink}
          onChange={(e) => {
            setPastedLink(e.target.value);
            setPasteError(false);
          }}
          placeholder="https://..."
          className="mt-3 w-full rounded border border-line bg-paper px-3 py-2 font-mono text-sm text-ink placeholder:text-ink/40 focus:border-accent focus:outline-none"
        />
        {pasteError && (
          <p className="mt-2 text-xs text-danger">
            Ez nem egy érvényes exportálási link.
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
  );
}
