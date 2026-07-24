"use client";

import { useSyncExternalStore } from "react";

const TICK_MS = 20_000;

function subscribe(callback: () => void) {
  const id = setInterval(callback, TICK_MS);
  return () => clearInterval(id);
}

// Rounded to the minute so repeated calls within the same minute return the
// same value — useSyncExternalStore re-invokes getSnapshot on every render
// to detect tearing, and a raw Date.now() would differ on every call and
// trigger an infinite render loop.
function getSnapshot(): number {
  return Math.floor(Date.now() / 60000) * 60000;
}

function getServerSnapshot(): number {
  return 0;
}

/** The current time in epoch ms, updated roughly every minute. */
export function useNow(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
