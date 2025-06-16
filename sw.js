const CACHE_NAME = 'task-reminder-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/index.js',
  '/mobile-init.js'
];

// Install service worker and cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Cache core files and ignore if some files are missing
        return Promise.all(
          urlsToCache.map(url => {
            return cache.add(url).catch(err => {
              console.log(`Failed to cache ${url}:`, err);
              return null;
            });
          })
        );
      })
  );
});

// Serve cached content when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

// Handle push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || 'You have a reminder!',
    icon: '/images/icon-192x192.png',
    badge: '/images/icon-192x192.png',
    vibrate: [200, 100, 200, 100, 200, 100, 200],
    tag: 'task-reminder',
    data: data
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Task Reminder', options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});
