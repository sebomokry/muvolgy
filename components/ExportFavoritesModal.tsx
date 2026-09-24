"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import type { FriendFavorite } from "@/hooks/useFriendFavorites";
import { buildOwnFavoritesUrl } from "@/lib/ownFavoritesUrl";
import { CopyButton } from "./CopyButton";

type Props = {
  programIds: number[];
  venueIds: number[];
  friends: FriendFavorite[];
  ownName: string;
  onClose: () => void;
};

export function ExportFavoritesModal({
  programIds,
  venueIds,
  friends,
  ownName,
  onClose,
}: Props) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const exportUrl = buildOwnFavoritesUrl(window.location.href, {
    programIds,
    venueIds,
    friends,
    ownName,
  });

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
      className="fixed inset-0 z-30 flex items-center justify-center bg-ink/25 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-sm overflow-y-auto rounded-3xl bg-paper p-6 shadow-2xl shadow-ink/20 ring-1 ring-ink/5"
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
          böngésződben/eszközödön — a kiválasztott programjaid,
          becsillagozott helyszíneid, a Barátaim listád és a saját neved
          is hozzáadódnak az ott már meglévőkhöz.
        </p>
        <div className="mt-3 flex justify-center">
          {qrDataUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrDataUrl}
              alt="QR-kód a kedvenceim exportálásához"
              width={240}
              height={240}
              className="h-auto max-w-full rounded-2xl"
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
