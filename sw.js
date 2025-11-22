self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('morning-quest-store').then((cache) => {
      // Basic caching if needed, keeping it minimal for now
      return cache.addAll([
        '/',
        '/index.html',
      ]);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});