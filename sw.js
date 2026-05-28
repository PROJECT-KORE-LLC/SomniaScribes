const CACHE_NAME = 'kore-v5.1';
const assets = [
  'index.html',
  'somniascribes.png',
  'fire.mp3',
  'thumbnail1.jpg'
  
];

// Force cache on install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(assets))
  );
});

// Intercept requests and serve from cache if offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
