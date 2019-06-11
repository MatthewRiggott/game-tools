var APP_NAME = 'pwa-playground_';
var VERSION = 'version_1';
var cacheName = APP_NAME + VERSION;
var repoPath = 'pwa-playground';
var filesToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js'
];
 
self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      let cacheFilePaths = filesToCache.map(f => `/${repoPath}${f}`);
      return cache.addAll(cacheFilePaths);
    })
  );
});
self.addEventListener('activate',  event => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request, {ignoreSearch:true}).then(response => {
      return response || fetch(event.request);
    })
  );
});
