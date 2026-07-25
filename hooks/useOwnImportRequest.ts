"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { FriendFavorite } from "./useFriendFavorites";

export type OwnImportRequest = {
  programIds: number[];
  venueIds: number[];
  friends: FriendFavorite[];
  ownName: string | null;
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

function parseFriendsList(raw: string | null): FriendFavorite[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is FriendFavorite =>
        typeof entry === "object" &&
        entry !== null &&
        typeof (entry as FriendFavorite).name === "string" &&
        Array.isArray((entry as FriendFavorite).programIds),
    );
  } catch {
    return [];
  }
}

function parseFromParams(params: URLSearchParams): OwnImportRequest {
  const programIds = parseIdList(params.get("myprograms"));
  const venueIds = parseIdList(params.get("myvenues"));
  const friends = parseFriendsList(params.get("myfriends"));
  const ownName = params.get("myname");
  if (
    programIds.length === 0 &&
    venueIds.length === 0 &&
    friends.length === 0 &&
    !ownName
  ) {
    return null;
  }
  return { programIds, venueIds, friends, ownName };
}

function parseFromLocation(): OwnImportRequest {
  return parseFromParams(new URLSearchParams(window.location.search));
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

/** Clears the pending import and strips the ?myprograms=&myvenues=&myfriends=&myname= params so a refresh doesn't re-prompt. */
function clearRequest() {
  ensureInitialized();
  request = null;
  const url = new URL(window.location.href);
  url.searchParams.delete("myprograms");
  url.searchParams.delete("myvenues");
  url.searchParams.delete("myfriends");
  url.searchParams.delete("myname");
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
  const parsedRequest = parseFromParams(parsed.searchParams);
  if (!parsedRequest) return false;
  request = parsedRequest;
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
