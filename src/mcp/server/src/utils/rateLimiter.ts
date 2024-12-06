import Redis from 'ioredis';
import logger from './logger';

export class RateLimiter {
  private redis: Redis;
  private window: number;
  private maxRequests: number;
  private burstLimit: number;

  constructor(redis: Redis, window = 60, maxRequests = 1000, burstLimit = 50) {
    this.redis = redis;
    this.window = window;
    this.maxRequests = maxRequests;
    this.burstLimit = burstLimit;
  }

  async isRateLimited(key: string): Promise<boolean> {
    const now = Date.now();
    const windowKey = `${key}:${Math.floor(now / (this.window * 1000))}`;
    
    try {
      const multi = this.redis.multi();
      multi.incr(windowKey);
      multi.expire(windowKey, this.window);
      
      const [count] = await multi.exec() as [number, any];
      
      if (count > this.maxRequests) {
        logger.warn(`Rate limit exceeded for ${key}`, { count, limit: this.maxRequests });
        return true;
      }

      if (count > this.burstLimit) {
        const burstKey = `${key}:burst:${now}`;
        const burstCount = await this.redis.incr(burstKey);
        await this.redis.pexpire(burstKey, 1000); // 1 second burst window
        
        if (burstCount > this.burstLimit) {
          logger.warn(`Burst limit exceeded for ${key}`, { burstCount, limit: this.burstLimit });
          return true;
        }
      }

      return false;
    } catch (error) {
      logger.error('Rate limiter error', { error });
      return false; // Fail open on Redis errors
    }
  }

  async getRemainingRequests(key: string): Promise<number> {
    const now = Date.now();
    const windowKey = `${key}:${Math.floor(now / (this.window * 1000))}`;
    
    try {
      const count = await this.redis.get(windowKey);
      return this.maxRequests - (parseInt(count || '0', 10));
    } catch (error) {
      logger.error('Error getting remaining requests', { error });
      return 0;
    }
  }
} 