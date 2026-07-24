"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { CopyButton } from "./CopyButton";

type Props = {
  programIds: number[];
  venueIds: number[];
  onClose: () => void;
};

function buildExportUrl(programIds: number[], venueIds: number[]): string {
  const url = new URL(window.location.href);
  url.search = "";
  url.searchParams.set("myprograms", programIds.join(","));
  url.searchParams.set("myvenues", venueIds.join(","));
  return url.toString();
}

export function ExportFavoritesModal({ programIds, venueIds, onClose }: Props) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const exportUrl = buildExportUrl(programIds, venueIds);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(exportUrl, { margin: 1, width: 240 }).then((dataUrl) => {
      if (!cancelled) setQrDataUrl(dataUrl);
    });
    return () => {
      cancelled = true;
    };
  }, [exportUrl]);

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-ink/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-sm overflow-y-auto rounded border border-line bg-paper p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-lg font-medium text-ink">
            Kedvenceim exportálása
          </h2>
          <button
            onClick={onClose}
            className="shrink-0 font-mono text-ink/70 hover:text-ink"
            aria-label="Bezárás"
          >
            ✕
          </button>
        </div>

        <p className="mt-3 text-sm text-ink/70">
          Ezt a QR-kódot vagy linket olvasd be (vagy nyisd meg) a másik
          böngésződben/eszközödön — a kiválasztott programjaid és
          becsillagozott helyszíneid hozzáadódnak az ott már meglévőkhöz.
        </p>
        <div className="mt-3 flex justify-center">
          {qrDataUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrDataUrl}
              alt="QR-kód a kedvenceim exportálásához"
              width={240}
              height={240}
              className="h-auto max-w-full rounded border border-line"
            />
          )}
        </div>
        <div className="mt-3 flex items-start gap-1.5">
          <p className="min-w-0 flex-1 truncate font-mono text-xs text-ink/70">
            {exportUrl}
          </p>
          <CopyButton value={exportUrl} label="Link másolása" />
        </div>
      </div>
    </div>
  );
}
