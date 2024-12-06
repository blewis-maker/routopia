/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAMES = {
  static: 'static-assets-v1',
  routes: 'route-data-v1',
  updates: 'route-updates-v1'
};

// Install event - create caches
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAMES.static),
      caches.open(CACHE_NAMES.routes),
      caches.open(CACHE_NAMES.updates)
    ])
  );
});

// Fetch event - handle route updates
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  if (url.pathname.startsWith('/api/routes/updates')) {
    event.respondWith(
      fetch(event.request)
        .then(async (response) => {
          const cache = await caches.open(CACHE_NAMES.updates);
          cache.put(event.request, response.clone());
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAMES.updates);
          return cache.match(event.request);
        })
    );
  }
});

// Push event - handle notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.description,
    icon: '/icons/route-update.png',
    badge: '/icons/badge-72x72.png',
    data: {
      routeId: data.routeId,
      type: data.type
    },
    tag: `route-${data.routeId}`,
    actions: [
      {
        action: 'view',
        title: 'View Route'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view' && event.notification.data?.routeId) {
    event.waitUntil(
      clients.openWindow(`/routes/${event.notification.data.routeId}`)
    );
  }
});

// Sync event - handle background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'route-updates-sync') {
    event.waitUntil(
      caches.open(CACHE_NAMES.updates)
        .then((cache) => cache.keys())
        .then((requests) =>
          Promise.all(
            requests.map(async (request) => {
              try {
                const response = await fetch(request);
                if (response.ok) {
                  const cache = await caches.open(CACHE_NAMES.updates);
                  await cache.delete(request);
                }
                return response;
              } catch (error) {
                return null;
              }
            })
          )
        )
    );
  }
}); 