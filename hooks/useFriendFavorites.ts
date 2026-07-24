"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "mv-friend-favorites";

export type FriendFavorite = {
  name: string;
  programIds: number[];
};

const EMPTY: FriendFavorite[] = [];

let friends: FriendFavorite[] = EMPTY;
let initialized = false;
const listeners = new Set<() => void>();

function readStored(): FriendFavorite[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
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

function ensureInitialized() {
  if (initialized) return;
  initialized = true;
  friends = readStored();
}

function persist() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(friends));
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): FriendFavorite[] {
  ensureInitialized();
  return friends;
}

function getServerSnapshot(): FriendFavorite[] {
  return EMPTY;
}

/** Adds or, if a friend with the same name already exists, replaces their program list. */
function addFriend(name: string, programIds: number[]) {
  ensureInitialized();
  const next = friends.filter((f) => f.name !== name);
  next.push({ name, programIds });
  friends = next;
  persist();
}

function removeFriend(name: string) {
  ensureInitialized();
  friends = friends.filter((f) => f.name !== name);
  persist();
}

export function useFriendFavorites() {
  const list = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return {
    friends: list,
    addFriend: useCallback(
      (name: string, programIds: number[]) => addFriend(name, programIds),
      [],
    ),
    removeFriend: useCallback((name: string) => removeFriend(name), []),
  };
}
