const CACHE_NAME = "memento-vivere-booking-v3";

const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.webmanifest?v=3",
  "./icons/icon-192.png?v=3"
];

self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    Promise.all([
      caches.keys().then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        )
      ),
      self.clients.claim()
    ])
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  if (url.origin !== location.origin) return;

  if (
    url.pathname.endsWith("/index.html") ||
    url.pathname === "/" ||
    url.pathname.endsWith("/manifest.webmanifest") ||
    url.pathname.endsWith("/sw.js")
  ) {
    event.respondWith(
      fetch(event.request, { cache: "no-store" }).catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      return (
        cached ||
        fetch(event.request).then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return response;
        })
      );
    })
  );
});
