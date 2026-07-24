"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "mv-own-name";

let name = "";
let initialized = false;
const listeners = new Set<() => void>();

function ensureInitialized() {
  if (initialized) return;
  initialized = true;
  name = window.localStorage.getItem(STORAGE_KEY) ?? "";
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): string {
  ensureInitialized();
  return name;
}

function getServerSnapshot(): string {
  return "";
}

function setName(next: string) {
  ensureInitialized();
  name = next;
  window.localStorage.setItem(STORAGE_KEY, next);
  listeners.forEach((listener) => listener());
}

/** The visitor's own display name, used when sharing their favorites, persisted across visits. */
export function useOwnName() {
  const ownName = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return { ownName, setOwnName: useCallback((next: string) => setName(next), []) };
}
