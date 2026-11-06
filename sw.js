'use strict';

const CACHE_PREFIX = 'bend-';
const CACHE_VERSION = 'v1.0.0';
const STATIC_CACHE = CACHE_PREFIX + 'static-' + CACHE_VERSION;
const RUNTIME_CACHE = CACHE_PREFIX + 'runtime-' + CACHE_VERSION;
const VUE_URL = 'https://cdn.jsdelivr.net/npm/vue@3.5.13/dist/vue.global.prod.js';

const BASE_URL = new URL('./', self.location.href);
const INDEX_URL = new URL('index.html', BASE_URL).href;

const LOCAL_ASSETS = [
  'index.html',
  'styles.css',
  'data.js',
  'app.js',
  'manifest.json',
  'icons/favicon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png',
  'assets/poses/breathing.svg',
  'assets/poses/cat-cow.svg',
  'assets/poses/side-bend.svg',
  'assets/poses/shoulder-roll.svg',
  'assets/poses/hip-flexor.svg',
  'assets/poses/hamstring-stand.svg',
  'assets/poses/squat.svg',
  'assets/poses/neck.svg',
  'assets/poses/shoulder-cross.svg',
  'assets/poses/chest-wall.svg',
  'assets/poses/seated-twist.svg',
  'assets/poses/butterfly.svg',
  'assets/poses/knee-chest.svg',
  'assets/poses/leg-swing.svg',
  'assets/poses/hip-circle.svg',
  'assets/poses/lunge-twist.svg',
  'assets/poses/downward-dog.svg',
  'assets/poses/calf-wall.svg',
  'assets/poses/quad-stand.svg',
  'assets/poses/hamstring-seated.svg',
  'assets/poses/pigeon.svg',
  'assets/poses/supine-twist.svg',
  'assets/poses/child-pose.svg',
  'assets/poses/bridge.svg',
  'assets/poses/warrior.svg',
  'assets/poses/triangle.svg',
  'assets/poses/legs-up-wall.svg',
  'assets/poses/savasana.svg',
  'assets/poses/reclined-butterfly.svg',
  'assets/poses/cobra.svg'
];

const CORE_ASSETS = LOCAL_ASSETS.map(function (path) {
  return new URL(path, BASE_URL).href;
});

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(function (cache) {
      const urls = CORE_ASSETS.concat([VUE_URL]);
      return Promise.all(urls.map(function (url) {
        return fetch(new Request(url, { cache: 'reload' }))
          .then(function (response) {
            if (response && (response.ok || response.type === 'opaque')) {
              return cache.put(url, response);
            }
            return null;
          })
          .catch(function () {
            return null;
          });
      }));
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (key) {
        if (key.indexOf(CACHE_PREFIX) === 0 && key !== STATIC_CACHE && key !== RUNTIME_CACHE) {
          return caches.delete(key);
        }
        return null;
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('message', function (event) {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

function networkFirstNavigation(event) {
  return fetch(event.request).then(function (response) {
    if (response && response.ok) {
      caches.open(STATIC_CACHE).then(function (cache) {
        return cache.put(INDEX_URL, response.clone());
      }).catch(function () {});
      return response;
    }
    return caches.match(INDEX_URL).then(function (cached) {
      return cached || response;
    });
  }).catch(function () {
    return caches.match(INDEX_URL).then(function (cached) {
      if (cached) return cached;
      return caches.match(BASE_URL.href);
    }).then(function (cached) {
      if (cached) return cached;
      return Response.error();
    });
  });
}

function staleWhileRevalidate(event, cacheName) {
  return caches.open(cacheName).then(function (cache) {
    return cache.match(event.request).then(function (cached) {
      const network = fetch(event.request).then(function (response) {
        if (response && (response.ok || response.type === 'opaque')) {
          cache.put(event.request, response.clone()).catch(function () {});
        }
        return response;
      }).catch(function () {
        return cached || null;
      });

      event.waitUntil(network.catch(function () {}));

      if (cached) return cached;
      return network.then(function (response) {
        if (response) return response;
        return caches.match(event.request);
      });
    });
  });
}

self.addEventListener('fetch', function (event) {
  const request = event.request;
  if (request.method !== 'GET') return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(event));
    return;
  }

  const url = new URL(request.url);
  const sameOrigin = url.origin === BASE_URL.origin;

  if (sameOrigin && url.href.indexOf(BASE_URL.href) === 0) {
    event.respondWith(staleWhileRevalidate(event, STATIC_CACHE));
    return;
  }

  if (url.origin === 'https://cdn.jsdelivr.net') {
    event.respondWith(staleWhileRevalidate(event, RUNTIME_CACHE));
  }
});
