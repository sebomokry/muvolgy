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
  // Assume "already seen" for SSR/hydration: this value is what the server
  // actually renders and what the client must match on its first paint,
  // before localStorage can be read at all. A false default would make the
  // intro modal appear in that raw HTML for every visitor, including
  // returning ones, until hydration corrects it a beat later — a visible
  // flash. Defaulting true instead means returning visitors (the common
  // case) never see anything, at the cost of a first-time visitor's modal
  // appearing slightly after load instead of immediately, which only ever
  // happens once per browser.
  return true;
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
