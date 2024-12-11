export const redisConfig = {
  development: {
    enabled: false, // Disable Redis in development by default
    url: process.env.UPSTASH_REDIS_URL,
    token: process.env.UPSTASH_REDIS_TOKEN,
    endpoint: process.env.REDIS_ENDPOINT,
    retryAttempts: 3,
    retryDelay: 50,
    timeout: 10000
  },
  production: {
    enabled: true,
    url: process.env.UPSTASH_REDIS_URL,
    token: process.env.UPSTASH_REDIS_TOKEN,
    endpoint: process.env.REDIS_ENDPOINT,
    retryAttempts: 5,
    retryDelay: 200,
    timeout: 30000
  }
};

export const getRedisConfig = () => {
  return process.env.NODE_ENV === 'production' 
    ? redisConfig.production 
    : redisConfig.development;
}; 