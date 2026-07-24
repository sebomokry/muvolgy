"use client";

import { useCallback, useSyncExternalStore } from "react";

export type ImportRequest = {
  name: string;
  ids: number[];
} | null;

let request: ImportRequest = null;
let initialized = false;
const listeners = new Set<() => void>();

function parseFromLocation(): ImportRequest {
  const params = new URLSearchParams(window.location.search);
  const name = params.get("friend");
  const idsRaw = params.get("ids");
  if (!name || !idsRaw) return null;
  const ids = idsRaw
    .split(",")
    .map(Number)
    .filter((n) => Number.isInteger(n));
  if (ids.length === 0) return null;
  return { name, ids };
}

function ensureInitialized() {
  if (initialized) return;
  initialized = true;
  request = parseFromLocation();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): ImportRequest {
  ensureInitialized();
  return request;
}

function getServerSnapshot(): ImportRequest {
  return null;
}

/** Clears the pending import and strips the ?friend=&ids= params so a refresh doesn't re-prompt. */
function clearRequest() {
  ensureInitialized();
  request = null;
  const url = new URL(window.location.href);
  url.searchParams.delete("friend");
  url.searchParams.delete("ids");
  window.history.replaceState({}, "", url);
  listeners.forEach((listener) => listener());
}

/** A pending "someone shared their favorites with you" request read once from the initial URL. */
export function useImportRequest() {
  const importRequest = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return { importRequest, clearRequest: useCallback(() => clearRequest(), []) };
}
