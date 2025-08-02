// Service Worker for RoomSpot - Aggressive Caching Strategy

const CACHE_NAME = 'roomspot-v1';
const STATIC_CACHE = 'roomspot-static-v1';
const DYNAMIC_CACHE = 'roomspot-dynamic-v1';

// Resources to cache immediately
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/careers.html',
    '/contact.html',
    '/privacy.html',
    '/src/styles/styles.css',
    '/src/styles/careers-enhanced.css',
    '/src/main.js',
    '/src/careers.js',
    '/src/contact.js',
    '/src/supabase-init.js',
    '/src/performance.js',
    '/src/assets/logo.png'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Service Worker: Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('Service Worker: Static assets cached');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Service Worker: Failed to cache static assets', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip Supabase API calls (always go to network)
    if (url.hostname.includes('supabase.co')) {
        return;
    }

    // Skip external CDN resources (let browser handle)
    if (url.hostname.includes('cdn.jsdelivr.net')) {
        return;
    }

    event.respondWith(
        // Try cache first (Cache First Strategy)
        caches.match(request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    // Serve from cache
                    return cachedResponse;
                }

                // Not in cache, fetch from network
                return fetch(request)
                    .then(networkResponse => {
                        // Don't cache if not successful
                        if (!networkResponse || networkResponse.status !== 200) {
                            return networkResponse;
                        }

                        // Clone the response
                        const responseToCache = networkResponse.clone();

                        // Determine which cache to use
                        let cacheName = DYNAMIC_CACHE;
                        if (STATIC_ASSETS.some(asset => request.url.endsWith(asset))) {
                            cacheName = STATIC_CACHE;
                        }

                        // Add to cache
                        caches.open(cacheName)
                            .then(cache => {
                                cache.put(request, responseToCache);
                            });

                        return networkResponse;
                    })
                    .catch(() => {
                        // Network failed, try to serve offline page
                        if (request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});

// Background sync for offline form submissions
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        console.log('Service Worker: Background sync triggered');
        event.waitUntil(
            // Handle offline form submissions
            handleOfflineSubmissions()
        );
    }
});

// Handle offline form submissions
async function handleOfflineSubmissions() {
    // This would handle any queued form submissions
    // For now, just log that sync is working
    console.log('Service Worker: Processing offline submissions');
}

// Message handling for manual cache updates
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'UPDATE_CACHE') {
        // Force cache update
        event.waitUntil(
            caches.delete(STATIC_CACHE)
                .then(() => caches.open(STATIC_CACHE))
                .then(cache => cache.addAll(STATIC_ASSETS))
        );
    }
});