import Redis from 'ioredis';
import logger from './logger';

enum CircuitState {
  CLOSED,
  OPEN,
  HALF_OPEN
}

interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  halfOpenRequests: number;
}

export class CircuitBreaker {
  private redis: Redis;
  private state: CircuitState;
  private failureCount: number;
  private lastFailureTime: number;
  private config: CircuitBreakerConfig;
  private serviceKey: string;

  constructor(
    redis: Redis,
    serviceKey: string,
    config: Partial<CircuitBreakerConfig> = {}
  ) {
    this.redis = redis;
    this.serviceKey = serviceKey;
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = 0;
    this.config = {
      failureThreshold: config.failureThreshold || 5,
      resetTimeout: config.resetTimeout || 60000,
      halfOpenRequests: config.halfOpenRequests || 3
    };
  }

  async recordSuccess(): Promise<void> {
    const key = `circuit:${this.serviceKey}`;
    await this.redis.multi()
      .set(`${key}:state`, CircuitState.CLOSED)
      .set(`${key}:failures`, '0')
      .exec();
    
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
  }

  async recordFailure(): Promise<void> {
    const key = `circuit:${this.serviceKey}`;
    const now = Date.now();

    this.failureCount++;
    this.lastFailureTime = now;

    if (this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
      await this.redis.multi()
        .set(`${key}:state`, CircuitState.OPEN)
        .set(`${key}:lastFailure`, now)
        .set(`${key}:failures`, this.failureCount)
        .exec();
      
      logger.warn(`Circuit opened for ${this.serviceKey}`, {
        failures: this.failureCount,
        lastFailure: now
      });
    }
  }

  async canRequest(): Promise<boolean> {
    const key = `circuit:${this.serviceKey}`;
    const now = Date.now();

    try {
      const [[, stateStr], [, lastFailureStr], [, failuresStr]] = await this.redis.multi()
        .get(`${key}:state`)
        .get(`${key}:lastFailure`)
        .get(`${key}:failures`)
        .exec() as [[null, string | null], [null, string | null], [null, string | null]];

      this.state = stateStr ? parseInt(stateStr, 10) : CircuitState.CLOSED;
      this.lastFailureTime = lastFailureStr ? parseInt(lastFailureStr, 10) : 0;
      this.failureCount = failuresStr ? parseInt(failuresStr, 10) : 0;

      switch (this.state) {
        case CircuitState.CLOSED:
          return true;

        case CircuitState.OPEN:
          if (now - this.lastFailureTime >= this.config.resetTimeout) {
            this.state = CircuitState.HALF_OPEN;
            await this.redis.set(`${key}:state`, CircuitState.HALF_OPEN);
            return true;
          }
          return false;

        case CircuitState.HALF_OPEN:
          const halfOpenKey = `${key}:halfOpen:${Math.floor(now / 1000)}`;
          const requests = await this.redis.incr(halfOpenKey);
          await this.redis.expire(halfOpenKey, 60);
          
          return requests <= this.config.halfOpenRequests;

        default:
          return true;
      }
    } catch (error) {
      logger.error('Circuit breaker error', { error });
      return true; // Fail open on Redis errors
    }
  }

  getState(): CircuitState {
    return this.state;
  }
} 