// ASD Acque Fucensi - Service Worker
// Cambia questo numero ad ogni aggiornamento dell'app!
var CACHE_VERSION = 'acque-fucensi-v3';
var FILES_TO_CACHE = ['/'];

// Installazione: salva in cache
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_VERSION).then(function(cache) {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// Attivazione: cancella cache vecchie
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_VERSION; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Fetch: serve dalla cache, ma controlla sempre aggiornamenti
self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(CACHE_VERSION).then(function(cache) {
      return cache.match(e.request).then(function(cached) {
        var fetchPromise = fetch(e.request).then(function(networkResponse) {
          cache.put(e.request, networkResponse.clone());
          return networkResponse;
        }).catch(function() { return cached; });
        return cached || fetchPromise;
      });
    })
  );
});

// Messaggio per forzare aggiornamento immediato
self.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
