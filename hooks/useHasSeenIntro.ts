"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "mv-seen-intro";

let seen = false;
let initialized = false;
const listeners = new Set<() => void>();

function ensureInitialized() {
  if (initialized) return;
  initialized = true;
  seen = window.localStorage.getItem(STORAGE_KEY) === "1";
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): boolean {
  ensureInitialized();
  return seen;
}

function getServerSnapshot(): boolean {
  return false;
}

function markSeen() {
  ensureInitialized();
  seen = true;
  window.localStorage.setItem(STORAGE_KEY, "1");
  listeners.forEach((listener) => listener());
}

/** Whether the visitor has already dismissed the app-info modal, persisted across visits. */
export function useHasSeenIntro() {
  const hasSeenIntro = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return { hasSeenIntro, markSeen: useCallback(() => markSeen(), []) };
}
