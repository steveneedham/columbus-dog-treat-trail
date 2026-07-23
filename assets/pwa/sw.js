/*
 * Columbus Dog Treat Trail — minimal offline-shell service worker.
 * Reference implementation: caches the app shell (this page + its CSS/JS)
 * so the map still opens (without fresh pin data) when offline, and lets
 * "Add to Home Screen" install as a standalone app with no app-store step.
 * A consuming project should register this from its own page:
 *   if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js');
 */
const CACHE_NAME = 'treat-trail-shell-v1';
const SHELL_ASSETS = ['./index.html', '../../styles.css'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).catch(() => cached))
  );
});
