"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js");
      return;
    }

    // Turbopack's dev-mode HMR assets have filenames that change on every
    // recompile; a service worker intercepting them causes ChunkLoadErrors.
    // Actively clean up anything a previous production build/test may have
    // registered in this browser, so dev mode self-heals with no manual
    // DevTools steps needed.
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    });
    if ("caches" in window) {
      caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
    }
  }, []);

  return null;
}
