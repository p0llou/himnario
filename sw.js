const CACHE = 'himnario-v1';
const FILES = ['./', './index.html', './manifest.json', './icon.svg'];

// Al instalar: guarda todos los archivos en caché
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(FILES))
  );
  self.skipWaiting();
});

// Al activar: elimina cachés viejos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Peticiones: caché primero, red como respaldo
// Si la red tiene una versión nueva, actualiza el caché en segundo plano
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const cached = await cache.match(e.request);
      const fetchPromise = fetch(e.request)
        .then(res => { cache.put(e.request, res.clone()); return res; })
        .catch(() => null);
      return cached || fetchPromise;
    })
  );
});
