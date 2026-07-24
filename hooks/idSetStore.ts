"use client";

import { useCallback, useSyncExternalStore } from "react";

const EMPTY: Set<number> = new Set();

type Listener = () => void;

/** A localStorage-backed Set<number> store shared across every consumer of a given key. */
export function createIdSetStore(storageKey: string) {
  let ids: Set<number> = EMPTY;
  let initialized = false;
  const listeners = new Set<Listener>();

  function readStoredIds(): Set<number> {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return new Set();
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return new Set();
      return new Set(
        parsed.filter((id): id is number => typeof id === "number"),
      );
    } catch {
      return new Set();
    }
  }

  function ensureInitialized() {
    if (initialized) return;
    initialized = true;
    ids = readStoredIds();
  }

  function subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function getSnapshot(): Set<number> {
    ensureInitialized();
    return ids;
  }

  function getServerSnapshot(): Set<number> {
    return EMPTY;
  }

  function toggle(id: number) {
    ensureInitialized();
    const next = new Set(ids);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    ids = next;
    window.localStorage.setItem(storageKey, JSON.stringify([...next]));
    listeners.forEach((listener) => listener());
  }

  /** Unions the given ids into the existing set rather than replacing it. */
  function addMany(newIds: number[]) {
    ensureInitialized();
    const next = new Set(ids);
    for (const id of newIds) next.add(id);
    ids = next;
    window.localStorage.setItem(storageKey, JSON.stringify([...next]));
    listeners.forEach((listener) => listener());
  }

  function useIdSet() {
    const selectedIds = useSyncExternalStore(
      subscribe,
      getSnapshot,
      getServerSnapshot,
    );

    return {
      selectedIds,
      toggle: useCallback((id: number) => toggle(id), []),
      addMany: useCallback((newIds: number[]) => addMany(newIds), []),
    };
  }

  return { useIdSet };
}
