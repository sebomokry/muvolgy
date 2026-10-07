import type { Metadata } from "next";
import { FavoritesView } from "@/components/fafesztival/FavoritesView";

export const metadata: Metadata = { title: "Kedvenceim – Budapest Fafesztivál 2026" };

export default function FafesztivalFavoritesPage() {
  return <FavoritesView />;
}
