"use client";

import { createIdSetStore } from "./idSetStore";

const store = createIdSetStore("mv-favorite-venues");

export function useFavoriteVenues() {
  const { selectedIds: favoriteIds, toggle } = store.useIdSet();
  return { favoriteIds, toggle };
}
