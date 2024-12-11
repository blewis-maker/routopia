import { cacheInvalidator } from './cacheInvalidation';

// User-related caches
cacheInvalidator.register('user:*', {
  pattern: 'user:*',
  ttl: 3600,
  dependencies: ['preferences:*', 'activity:*']
});

// Route-related caches
cacheInvalidator.register('route:*', {
  pattern: 'route:*',
  ttl: 1800,
  dependencies: ['weather:*', 'traffic:*']
});

// Packing list caches
cacheInvalidator.register('packing:*', {
  pattern: 'packing:*',
  ttl: 7200
});

// Weather data cache
cacheInvalidator.register('weather:*', {
  pattern: 'weather:*',
  ttl: 900 // 15 minutes
});

// Traffic data cache
cacheInvalidator.register('traffic:*', {
  pattern: 'traffic:*',
  ttl: 300 // 5 minutes
}); 