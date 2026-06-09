/* SOMNIASCRIBES SERVICE WORKER
   Lore Oracle + harder Nib games + clean phone weather build.
   Put beside index.html.
*/

const CACHE_VERSION = 'somniascribes-v35-return-to-dot-com';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './sw.js'
];

const CORE_IMAGES = [
  './scribes1.0.png',
  './scribe1.png',
  './scribe.png',
  './librarian.png',
  './moth.png',
  './ship.png',
  './somniascribes.png',
  './rainywindow.png',
  './candledesk.png',
  './midnightpages.png',
  './forestmargins.png',
  './blanketfort.png',
  './inkandthunder.png',
  './gentlestatic.png',
  './moonlitarchive.png',
  './nib_candle_mouse.png',
  './nib_reaction_cozy.png',
  './nib_reaction_startled.png',
  './nib_reaction_curious.png',
  './catchnib.png',
  './feednib.png'
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

const PRECACHE_ASSETS = [
  ...APP_SHELL,
  ...CORE_IMAGES,
  ...AUDIO_ASSETS
];

async function cacheAsset(cache, assetUrl) {
  try {
    const response = await fetch(new Request(assetUrl, { cache: 'reload' }));
    if (response && response.ok) {
      await cache.put(assetUrl, response);
    } else {
      console.warn('[SomniaScribes SW] Skipped:', assetUrl, response && response.status);
    }
  } catch (error) {
    console.warn('[SomniaScribes SW] Missing or uncached:', assetUrl, error);
  }
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => Promise.all(PRECACHE_ASSETS.map(asset => cacheAsset(cache, asset))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_VERSION).map(key => caches.delete(key))))
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
        if (response && response.ok && url.pathname.match(/\.(html|css|js|json|png|jpg|jpeg|webp|gif|svg|ico|mp3|wav|ogg|m4a|flac)$/i)) {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
