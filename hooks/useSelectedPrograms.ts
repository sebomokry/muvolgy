"use client";

import { createIdSetStore } from "./idSetStore";

const store = createIdSetStore("mv-selected-programs");

export function useSelectedPrograms() {
  const { selectedIds, toggle } = store.useIdSet();
  return { selectedIds, toggle };
}
