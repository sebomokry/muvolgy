"use client";

import { useCallback, useSyncExternalStore } from "react";

export type OwnImportRequest = {
  programIds: number[];
  venueIds: number[];
} | null;

let request: OwnImportRequest = null;
let initialized = false;
const listeners = new Set<() => void>();

function parseIdList(raw: string | null): number[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map(Number)
    .filter((n) => Number.isInteger(n));
}

function parseFromLocation(): OwnImportRequest {
  const params = new URLSearchParams(window.location.search);
  if (!params.has("myprograms") && !params.has("myvenues")) return null;
  const programIds = parseIdList(params.get("myprograms"));
  const venueIds = parseIdList(params.get("myvenues"));
  if (programIds.length === 0 && venueIds.length === 0) return null;
  return { programIds, venueIds };
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

function getSnapshot(): OwnImportRequest {
  ensureInitialized();
  return request;
}

function getServerSnapshot(): OwnImportRequest {
  return null;
}

/** Clears the pending import and strips the ?myprograms=&myvenues= params so a refresh doesn't re-prompt. */
function clearRequest() {
  ensureInitialized();
  request = null;
  const url = new URL(window.location.href);
  url.searchParams.delete("myprograms");
  url.searchParams.delete("myvenues");
  window.history.replaceState({}, "", url);
  listeners.forEach((listener) => listener());
}

/** Lets a manually-pasted export link (not just the initial URL) drive the same pending state. */
function setRequestFromUrl(rawUrl: string): boolean {
  ensureInitialized();
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return false;
  }
  const programIds = parseIdList(parsed.searchParams.get("myprograms"));
  const venueIds = parseIdList(parsed.searchParams.get("myvenues"));
  if (programIds.length === 0 && venueIds.length === 0) return false;
  request = { programIds, venueIds };
  listeners.forEach((listener) => listener());
  return true;
}

/** A pending "restore my own favorites from another browser" request read once from the initial URL. */
export function useOwnImportRequest() {
  const importRequest = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return {
    importRequest,
    clearRequest: useCallback(() => clearRequest(), []),
    setRequestFromUrl: useCallback((rawUrl: string) => setRequestFromUrl(rawUrl), []),
  };
}
