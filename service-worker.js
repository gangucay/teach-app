const CACHE_NAME = 'teachapp-cache-v1';
const URLS_TO_CACHE = [
  '.',
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
  'https://cdn.tailwindcss.com',
  'https://esm.sh/@google/genai@^1.14.0',
  'https://esm.sh/react@^19.1.1',
  'https://esm.sh/react-dom@^19.1.1/'
];

// Install event: cache all essential assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Add icons to cache list
        const urlsWithIcons = [...URLS_TO_CACHE, './icon-192.png', './icon-512.png'];
        return cache.addAll(urlsWithIcons);
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
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event: serve from cache first, then network
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(event.request);
      
      const fetchedResponsePromise = fetch(event.request).then((networkResponse) => {
        // Check if we received a valid response and cache it
        if (networkResponse && networkResponse.status === 200) {
            // Do not cache API requests to esm.sh if they are not in the initial list
            // This prevents caching dynamic imports that might change
            if (!URLS_TO_CACHE.some(url => networkResponse.url.startsWith(url))) {
               // Clone the response because it's a stream and can only be consumed once.
               cache.put(event.request, networkResponse.clone());
            }
        }
        return networkResponse;
      }).catch(() => {
        // Fetch failed, maybe network error. If we have a cached response, it's already handled.
        // If not, this will result in a network error page.
      });

      return cachedResponse || fetchedResponsePromise;
    })
  );
});