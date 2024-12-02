const deploymentConfig = {
  environments: {
    production: {
      api: {
        baseUrl: 'https://api.routopia.com',
        version: 'v1',
        timeout: 30000,
        retryAttempts: 3
      },
      cache: {
        ttl: 3600000, // 1 hour
        maxSize: 100 * 1024 * 1024 // 100MB
      },
      features: {
        maps: true,
        aiSuggestions: true,
        realTimeUpdates: true,
        analytics: true
      }
    },
    staging: {
      api: {
        baseUrl: 'https://staging-api.routopia.com',
        version: 'v1',
        timeout: 30000,
        retryAttempts: 3
      },
      cache: {
        ttl: 1800000, // 30 minutes
        maxSize: 50 * 1024 * 1024 // 50MB
      },
      features: {
        maps: true,
        aiSuggestions: true,
        realTimeUpdates: true,
        analytics: true
      }
    }
  },
  scaling: {
    maxConcurrentUsers: 10000,
    autoScaling: {
      minInstances: 3,
      maxInstances: 10,
      scaleUpThreshold: 0.7, // 70% CPU
      scaleDownThreshold: 0.3 // 30% CPU
    }
  }
};

module.exports = { deploymentConfig }; 