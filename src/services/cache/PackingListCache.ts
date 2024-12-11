import { redis } from '@/lib/redis';
import { PackingList } from '@/types/packing';

export class PackingListCache {
  private readonly prefix = 'packing:';
  private readonly ttl = 3600; // 1 hour

  async get(listId: string): Promise<PackingList | null> {
    const data = await redis.get(this.getKey(listId));
    return data ? JSON.parse(data) : null;
  }

  async set(listId: string, list: PackingList): Promise<void> {
    await redis.setex(this.getKey(listId), this.ttl, JSON.stringify(list));
  }

  async delete(listId: string): Promise<void> {
    await redis.del(this.getKey(listId));
  }

  async getUserLists(userId: string): Promise<PackingList[]> {
    const data = await redis.get(this.getUserKey(userId));
    return data ? JSON.parse(data) : [];
  }

  async setUserLists(userId: string, lists: PackingList[]): Promise<void> {
    await redis.setex(this.getUserKey(userId), this.ttl, JSON.stringify(lists));
  }

  private getKey(listId: string): string {
    return `${this.prefix}list:${listId}`;
  }

  private getUserKey(userId: string): string {
    return `${this.prefix}user:${userId}`;
  }
} 