export class RedisError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RedisError';
  }
}

export class RedisConnectionError extends RedisError {
  constructor(message: string) {
    super(`Redis connection error: ${message}`);
    this.name = 'RedisConnectionError';
  }
}

export class RedisCacheError extends RedisError {
  constructor(operation: string, key: string, error: Error) {
    super(`Redis ${operation} failed for key '${key}': ${error.message}`);
    this.name = 'RedisCacheError';
  }
} 