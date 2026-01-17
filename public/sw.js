/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'streamlit-audio-v1';
const STATIC_CACHE = 'streamlit-static-v1';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/dashboard',
  '/manifest.json',
  '/favicon.ico',
];

// Patterns for cacheable assets
const CACHEABLE_PATTERNS = [
  /\/_next\/static\//,     // Next.js static chunks
  /\.woff2?$/,              // Fonts
  /\.png$|\.jpg$|\.svg$/,   // Images
  /\.js$|\.css$/,           // Scripts and styles
];

// Network-first patterns (always try network first)
const NETWORK_FIRST_PATTERNS = [
  /\/api\//,                // API calls
  /supabase/,               // Supabase requests
  /_next\/data\//,          // Next.js data fetching
];

/**
 * Service Worker for Offline Support
 *
 * Critical for fieldwork in PNG where connectivity is unreliable.
 * Caches static assets and app shell for offline access.
 *
 * Strategy:
 * - Precache essential app shell on install
 * - Cache-first for static assets (fonts, images, chunks)
 * - Network-first for API calls and dynamic data
 * - Stale-while-revalidate for pages
 */

// Install event - precache assets
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);

      // Precache essential assets
      const precachePromises = PRECACHE_ASSETS.map(async (url) => {
        try {
          const response = await fetch(url);
          if (response.ok) {
            await cache.put(url, response);
          }
        } catch (error) {
          console.warn(`Failed to precache ${url}:`, error);
        }
      });

      await Promise.all(precachePromises);

      // Skip waiting to activate immediately
      await self.skipWaiting();
    })()
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      // Delete old caches
      const cacheNames = await caches.keys();
      const oldCaches = cacheNames.filter(
        (name) => name !== CACHE_NAME && name !== STATIC_CACHE
      );

      await Promise.all(oldCaches.map((name) => caches.delete(name)));

      // Take control of all clients immediately
      await self.clients.claim();
    })()
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin requests (except for fonts/CDN assets)
  if (url.origin !== self.location.origin) {
    // Allow CDN fonts and assets
    if (!url.hostname.includes('fonts') && !url.hostname.includes('cdn')) {
      return;
    }
  }

  // Network-first for API and auth
  if (NETWORK_FIRST_PATTERNS.some((pattern) => pattern.test(request.url))) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Cache-first for static assets
  if (CACHEABLE_PATTERNS.some((pattern) => pattern.test(request.url))) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Stale-while-revalidate for pages
  event.respondWith(staleWhileRevalidate(request));
});

/**
 * Cache-first strategy
 */
async function cacheFirst(request: Request): Promise<Response> {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return offline fallback if available
    const fallback = await caches.match('/');
    if (fallback) return fallback;
    throw error;
  }
}

/**
 * Network-first strategy
 */
async function networkFirst(request: Request): Promise<Response> {
  try {
    const response = await fetch(request);
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw error;
  }
}

/**
 * Stale-while-revalidate strategy
 */
async function staleWhileRevalidate(request: Request): Promise<Response> {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  // Fetch in background and update cache
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => {
      // If offline and no cache, try fallback
      return cached || caches.match('/');
    });

  // Return cached immediately if available, otherwise wait for fetch
  return cached || (await fetchPromise) || new Response('Offline', { status: 503 });
}

// Handle messages from main thread
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data?.type === 'CLEAR_CACHE') {
    caches.keys().then((names) =>
      Promise.all(names.map((name) => caches.delete(name)))
    );
  }
});

export {};
