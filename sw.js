/**
 * Service Worker for Friday Saga PWA
 * Provides offline caching without install prompts
 */

const CACHE_NAME = 'friday-saga-v2';
const STATIC_CACHE_NAME = 'friday-saga-static-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/js/main.js',
  '/js/modules/Animations.js',
  '/js/modules/ContentRenderer.js',
  '/js/modules/DataLoader.js',
  '/js/modules/TabManager.js',
  '/js/modules/VideoLoader.js',
  '/js/modules/YouTubeEmbed.js',
  '/favicon.ico',
  '/favicon.svg',
  '/icon-192.png',
  '/icon-512.png'
];

// Data files that should use network-first strategy
const DATA_FILES = [
  '/data/characters.json',
  '/data/jokes.json',
  '/data/themes.json',
  '/data/videos.json'
];

// Install event - cache static resources only
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Cache failed:', error);
      })
  );
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all pages immediately
  return self.clients.claim();
});

// Fetch event - network-first for data files, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Check if the request is for a data file (ignoring query parameters)
  const isDataFile = DATA_FILES.some(dataPath => url.pathname === dataPath);

  if (isDataFile) {
    // Network-first strategy for data files
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone the response before caching
          const responseToCache = response.clone();
          // Update cache with fresh data
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // If network fails, try cache
          return caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || new Response('Offline', { status: 503 });
          });
        })
    );
  } else {
    // Cache-first strategy for static assets
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          // Not in cache, fetch from network
          return fetch(event.request).then((networkResponse) => {
            // Cache the response for future use
            const responseToCache = networkResponse.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
            return networkResponse;
          });
        })
        .catch(() => {
          // If both fail, return offline page for documents
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        })
    );
  }
});


