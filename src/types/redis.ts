import { RedisOptions } from 'ioredis';

export interface RedisConfig {
  url?: string;
  host?: string;
  port?: number;
  password?: string;
  tls?: boolean;
}

export interface RedisConnectionOptions extends RedisOptions {
  tls?: {
    rejectUnauthorized?: boolean;
    servername?: string;
  };
} 