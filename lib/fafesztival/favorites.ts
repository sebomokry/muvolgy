import { createIdSetStore } from "@/hooks/idSetStore";

// Own key so Fafesztivál picks never mix with muvolgy's `mv-*` favorites on
// the shared origin.
const store = createIdSetStore("ff26-favs");

export function useFfFavorites() {
  return store.useIdSet();
}
