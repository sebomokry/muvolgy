"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

type Props = {
  active: boolean;
  onDecoded: (rawText: string) => void;
};

type Status = "starting" | "running" | "denied" | "unavailable";

export function FriendQrScanner({ active, onDecoded }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<Status>("starting");
  // Without this, a code that's still in frame the instant scanning resumes
  // (e.g. right after tapping "Hozzáadás" while still pointing at the same
  // QR) would immediately re-trigger the same confirm dialog again.
  const lastDecodedRef = useRef<string | null>(null);

  useEffect(() => {
    const videoEl = videoRef.current;
    let cancelled = false;
    let stream: MediaStream | null = null;

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        if (!cancelled) setStatus("unavailable");
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        if (videoEl) {
          videoEl.srcObject = stream;
          await videoEl.play();
        }
        setStatus("running");
      } catch {
        if (!cancelled) setStatus("denied");
      }
    }

    start();

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
      if (videoEl) videoEl.srcObject = null;
    };
  }, []);

  useEffect(() => {
    if (status !== "running" || !active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let rafId: number;

    function tick() {
      const video = videoRef.current;
      if (video && canvas && ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code?.data && code.data !== lastDecodedRef.current) {
          lastDecodedRef.current = code.data;
          onDecoded(code.data);
          return;
        }
      }
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, [status, active, onDecoded]);

  return (
    <div>
      <div className="relative overflow-hidden rounded border border-line bg-ink/5">
        <video
          ref={videoRef}
          playsInline
          muted
          className="aspect-square w-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
        {status === "starting" && (
          <div className="absolute inset-0 flex items-center justify-center bg-paper/80">
            <p className="text-sm text-ink/70">Kamera indítása…</p>
          </div>
        )}
      </div>
      {(status === "denied" || status === "unavailable") && (
        <p className="mt-2 text-sm text-ink/70">
          Nem sikerült elérni a kamerát. Engedélyezd a hozzáférést a
          böngésző beállításaiban, vagy illeszd be a linket lentebb.
        </p>
      )}
    </div>
  );
}
