"use client";

import { createIdSetStore } from "./idSetStore";

const store = createIdSetStore("mv-favorite-venues");

export function useFavoriteVenues() {
  const { selectedIds: favoriteIds, toggle, addMany } = store.useIdSet();
  return { favoriteIds, toggle, addMany };
}
