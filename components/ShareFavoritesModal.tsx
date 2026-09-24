"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useOwnName } from "@/hooks/useOwnName";
import { CopyButton } from "./CopyButton";

type Props = {
  programIds: number[];
  onClose: () => void;
};

function buildShareUrl(name: string, programIds: number[]): string {
  const url = new URL(window.location.href);
  url.search = "";
  url.searchParams.set("friend", name);
  url.searchParams.set("ids", programIds.join(","));
  return url.toString();
}

export function ShareFavoritesModal({ programIds, onClose }: Props) {
  const { ownName, setOwnName } = useOwnName();
  const [nameDraft, setNameDraft] = useState(ownName);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const confirmedName = ownName || null;
  const shareUrl = confirmedName ? buildShareUrl(confirmedName, programIds) : null;

  useEffect(() => {
    if (!shareUrl) return;
    let cancelled = false;
    QRCode.toDataURL(shareUrl, { margin: 1, width: 240 }).then((dataUrl) => {
      if (!cancelled) setQrDataUrl(dataUrl);
    });
    return () => {
      cancelled = true;
    };
  }, [shareUrl]);

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
            Kedvenceim megosztása
          </h2>
          <button
            onClick={onClose}
            className="shrink-0 font-mono text-ink/70 hover:text-ink"
            aria-label="Bezárás"
          >
            ✕
          </button>
        </div>

        {!confirmedName ? (
          <div className="mt-3">
            <p className="text-sm text-ink/70">
              Milyen néven lássa a barátod, hogy kitől jött a megosztás?
            </p>
            <input
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              placeholder="A neved"
              className="mt-2 w-full rounded-xl border border-transparent bg-ink/5 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:border-accent/40 focus:bg-paper focus:outline-none"
            />
            <button
              onClick={() => setOwnName(nameDraft.trim())}
              disabled={nameDraft.trim().length === 0}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 font-display text-sm font-medium text-paper transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              Tovább
            </button>
          </div>
        ) : (
          <div className="mt-3">
            <p className="text-sm text-ink/70">
              Ezt a QR-kódot vagy linket küldd el a barátodnak — a saját
              alkalmazásában be tudja olvasni, és hozzáadhatja a
              &bdquo;Barátaim&rdquo; listájához.
            </p>
            <div className="mt-3 flex justify-center">
              {qrDataUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrDataUrl}
                  alt="QR-kód a kedvenceim megosztásához"
                  width={240}
                  height={240}
                  className="h-auto max-w-full rounded-2xl"
                />
              )}
            </div>
            <div className="mt-3 flex items-start gap-1.5">
              <p className="min-w-0 flex-1 truncate font-mono text-xs text-ink/70">
                {shareUrl}
              </p>
              {shareUrl && <CopyButton value={shareUrl} label="Link másolása" />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
