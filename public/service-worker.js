const CACHE_NAME = 'livechat-cache-v1';
const urlsToCache = [
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
  'https://placehold.co/32x32?text=lvchat',
  'https://placehold.co/192x192?text=lvchat',
  'https://placehold.co/512x512?text=lvchat'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});