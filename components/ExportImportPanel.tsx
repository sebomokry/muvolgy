"use client";

import { InfoFooter } from "./InfoFooter";

type Props = {
  onExport: () => void;
  onImport: () => void;
  canExport: boolean;
  onOpenInfo: () => void;
};

export function ExportImportPanel({
  onExport,
  onImport,
  canExport,
  onOpenInfo,
}: Props) {
  return (
    <div className="mx-auto h-full max-w-3xl overflow-y-auto px-4 py-6">
      <div className="flex gap-2">
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
      {!canExport && (
        <p className="mt-2 text-center text-xs text-ink/70">
          Válassz ki legalább egy programot vagy csillagozz be egy helyszínt
          az exportáláshoz.
        </p>
      )}
      <p className="mt-6 text-sm text-ink/70">
        A &bdquo;Saját&rdquo; kedvenceidet (kiválasztott programok és
        becsillagozott helyszínek) QR-kóddal vagy linkkel átviheted egy
        másik böngészőbe vagy eszközre — az ott már meglévő kedvenceidhez
        hozzáadódnak, nem írják felül azokat.
      </p>
      <InfoFooter onOpenInfo={onOpenInfo} />
    </div>
  );
}
