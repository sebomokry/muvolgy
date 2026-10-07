import type { Metadata } from "next";
import { MapLoader } from "@/components/fafesztival/MapLoader";

export const metadata: Metadata = { title: "Térkép – Budapest Fafesztivál 2026" };

export default function FafesztivalMapPage() {
  return <MapLoader />;
}
