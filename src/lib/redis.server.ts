import { RedisService } from '@/services/cache/RedisService';

let globalRedisService: RedisService | undefined;

export async function getRedisService() {
  if (typeof window !== 'undefined') {
    return null;
  }

  if (!globalRedisService) {
    globalRedisService = RedisService.getInstance();
    await globalRedisService.initialize();
  }

  return globalRedisService;
} 