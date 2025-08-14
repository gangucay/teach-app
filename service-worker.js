const CACHE_NAME = 'teachapp-cache-v2'; // Changed cache version to force update
const URLS_TO_CACHE = [
  './',
  './index.html',
  './index.tsx',
  './App.tsx',
  './types.ts',
  './context/AppContext.tsx',
  './services/geminiService.ts',
  './components/Icons.tsx',
  './components/Modal.tsx',
  './pages/MainPage.tsx',
  './pages/StudentListPage.tsx',
  './pages/StudentDetailPage.tsx',
  './manifest.json',
  './vite.svg',
  './icon-192.png',
  './icon-512.png',
  'https://cdn.tailwindcss.com',
  'https://esm.sh/@google/genai@^1.14.0',
  'https://esm.sh/react@^19.1.1',
  'https://esm.sh/react-dom@^19.1.1/'
];

// Install event: cache all essential assets
self.addEventListener('install', event => {
  self.skipWaiting(); // Force the new service worker to activate immediately
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching assets');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of all open clients
  );
});

// Fetch event: serve from cache first, then network
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached response if found
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise, fetch from network
        return fetch(event.request).then(networkResponse => {
            // Check if we received a valid response
            if (networkResponse && networkResponse.status === 200) {
                 // We don't need to cache the network response here
                 // because our initial list is comprehensive for the offline shell.
                 // This simplifies the logic.
            }
            return networkResponse;
        });
      })
  );
});
