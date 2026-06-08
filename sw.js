/* SOMNIASCRIBES PWA SERVICE WORKER
   Put this file beside index.html.
   GitHub Pages filenames are case-sensitive.
*/

const CACHE_VERSION = 'somniascribes-v6-full-audio-library';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './sw.js'
];

const IMAGE_ASSETS = [
  './scribes1.0.png',
  './scribe1.png'
];

const AUDIO_ASSETS = [
  './binarymusicbox.mp3',
  './cat.mp3',
  './clock.mp3',
  './crickets.mp3',
  './darkmusic1.mp3',
  './fire.mp3',
  './frogs.mp3',
  './musicbox1.mp3',
  './musicbox2.mp3',
  './musicbox3.mp3',
  './owls.mp3',
  './rain.mp3',
  './raven.mp3',
  './simmeringpot.mp3',
  './teacup.mp3',
  './thunder.mp3',
  './waves.mp3',
  './windchimes.mp3',
  './winterwind.mp3',
  './xmasmusicbox1.mp3',
  './xmasmusicbox2.mp3',
  './xmasmusicbox3.mp3'
];

const OPTIONAL_ICON_ASSETS = [
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icon-192.png',
  './icon-512.png'
];

const PRECACHE_ASSETS = [
  ...APP_SHELL,
  ...IMAGE_ASSETS,
  ...AUDIO_ASSETS,
  ...OPTIONAL_ICON_ASSETS
];

async function cacheAsset(cache, assetUrl) {
  try {
    const request = new Request(assetUrl, { cache: 'reload' });
    const response = await fetch(request);

    if (response && response.ok) {
      await cache.put(assetUrl, response);
      console.log('[SomniaScribes SW] Cached:', assetUrl);
      return true;
    }

    console.warn('[SomniaScribes SW] Skipped asset, bad response:', assetUrl, response && response.status);
    return false;
  } catch (error) {
    console.warn('[SomniaScribes SW] Could not precache:', assetUrl, error);
    return false;
  }
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(async cache => {
        await Promise.all(PRECACHE_ASSETS.map(asset => cacheAsset(cache, asset)));
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_VERSION)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html').then(cached => cached || caches.match('./')))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request).then(response => {
        if (!response || !response.ok) return response;

        const shouldCache = url.pathname.match(/\.(html|css|js|json|png|jpg|jpeg|webp|gif|svg|ico|mp3|wav|ogg|m4a|flac)$/i);

        if (shouldCache) {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(request, copy));
        }

        return response;
      });
    }).catch(() => {
      if (request.destination === 'document') {
        return caches.match('./index.html');
      }

      return undefined;
    })
  );
});
