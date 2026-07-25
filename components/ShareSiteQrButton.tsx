"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import QRCode from "qrcode";
import { CopyButton } from "./CopyButton";

const SITE_URL = "https://muvolgyprogi.hu/";

export function ShareSiteQrButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(SITE_URL, { margin: 1, width: 240 }).then((dataUrl) => {
      if (!cancelled) setQrDataUrl(dataUrl);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Az oldal megosztása QR-kóddal"
        className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-ink transition-opacity hover:opacity-90"
      >
        {qrDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qrDataUrl}
            alt=""
            width={24}
            height={24}
            className="h-full w-full object-cover"
          />
        )}
      </button>

      {isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-30 flex items-center justify-center bg-ink/40 p-4"
            onClick={() => setIsOpen(false)}
          >
            <div
              className="max-h-[85vh] w-full max-w-sm overflow-y-auto rounded border border-line bg-paper p-5 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display text-lg font-medium text-ink">
                  Az oldal megosztása
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="shrink-0 font-mono text-ink/70 hover:text-ink"
                  aria-label="Bezárás"
                >
                  ✕
                </button>
              </div>

              <p className="mt-3 text-sm text-ink/70">
                Ezt a QR-kódot olvastasd be egy másik telefonnal, hogy ő is
                megnyithassa ezt az oldalt.
              </p>

              <div className="mt-3 flex justify-center">
                {qrDataUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrDataUrl}
                    alt="QR-kód az oldal megnyitásához"
                    width={240}
                    height={240}
                    className="h-auto max-w-full rounded border border-line"
                  />
                )}
              </div>

              <div className="mt-3 flex items-start gap-1.5">
                <p className="min-w-0 flex-1 truncate font-mono text-xs text-ink/70">
                  {SITE_URL}
                </p>
                <CopyButton value={SITE_URL} label="Link másolása" />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
