"use client";

import dynamic from "next/dynamic";

// Leaflet touches `window` at import time, so the map is client-only.
const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => <div className="mt-24 text-center text-ff-muted">Térkép betöltése…</div>,
});

export function MapLoader() {
  return <MapView />;
}
