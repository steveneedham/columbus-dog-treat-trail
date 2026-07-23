/*
 * Copyright (c) 2026 Steven Needham — MIT License (see repo LICENSE)
 *
 * Columbus Dog Treat Trail — offline app-shell service worker.
 * -------------------------------------------------------------
 * Adapted from the design system's assets/pwa/sw.js reference for a
 * root-level deployment. Must live at the site root (not nested in
 * assets/) — a service worker's registration scope can't extend past
 * the directory it's served from unless the server sends a
 * Service-Worker-Allowed header, which GitHub Pages doesn't support.
 *
 * Caches just the shell (this page — index.html is fully self-
 * contained, no separate CSS/JS to fetch) so the map still opens
 * (showing whatever pins were last loaded, not fresh ones) when
 * offline, and lets "Add to Home Screen" install it as a standalone
 * app. Registered from index.html; see manifest.webmanifest alongside
 * this file for the installable-app metadata.
 */
const CACHE_NAME = 'treat-trail-shell-v1';
const SHELL_ASSETS = ['./index.html', './assets/analytics.js'];

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
