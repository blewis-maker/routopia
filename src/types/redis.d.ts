import { Redis as UpstashRedis } from '@upstash/redis';

declare module '@upstash/redis' {
  interface Redis extends UpstashRedis {
    info(): Promise<{
      used_memory: number;
      connected_clients: number;
      uptime_in_seconds: number;
      version: string;
      total_system_memory: number;
      used_memory_peak: number;
    }>;
    pipeline(): Pipeline;
    mget(...keys: string[]): Promise<(string | null)[]>;
    setEx(key: string, seconds: number, value: string): Promise<'OK'>;
    hgetall(key: string): Promise<Record<string, string> | null>;
    zadd(key: string, score: number, member: string): Promise<number>;
    zrange(key: string, start: number, stop: number): Promise<string[]>;
  }

  interface Pipeline {
    set(key: string, value: string, options?: { ex?: number }): Pipeline;
    del(key: string): Pipeline;
    exec(): Promise<Array<'OK' | null>>;
  }

  interface RedisOptions {
    url?: string;
    token?: string;
    automaticDeserialization?: boolean;
  }
} 