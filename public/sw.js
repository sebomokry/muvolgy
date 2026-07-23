const CACHE_NAME = "muvolgy-runtime-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Network-first, cache-fallback: whatever loads successfully once (this
// page, its hashed _next/static assets, fonts) gets cached, so a later
// offline visit can still serve it. No build-time precache list, since
// Next.js's hashed asset filenames change every build.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();
        caches
          .open(CACHE_NAME)
          .then((cache) => cache.put(event.request, responseClone));
        return response;
      })
      .catch(() => caches.match(event.request)),
  );
});
