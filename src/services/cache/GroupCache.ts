import { redis } from '@/lib/redis';
import { GroupTrip } from '@/types/groups';

export class GroupCache {
  private readonly prefix = 'group:';
  private readonly userPrefix = 'user-groups:';
  private readonly ttl = 3600; // 1 hour

  async get(groupId: string): Promise<GroupTrip | null> {
    const data = await redis.get(this.getKey(groupId));
    return data ? JSON.parse(data) : null;
  }

  async set(groupId: string, group: GroupTrip): Promise<void> {
    await redis.setex(this.getKey(groupId), this.ttl, JSON.stringify(group));
    await this.updateUserGroupsCache(group);
  }

  async getUserGroups(userId: string): Promise<GroupTrip[] | null> {
    const data = await redis.get(this.getUserKey(userId));
    return data ? JSON.parse(data) : null;
  }

  async invalidateGroup(groupId: string): Promise<void> {
    await redis.del(this.getKey(groupId));
    // Also invalidate user group lists that contain this group
    const group = await this.get(groupId);
    if (group) {
      await Promise.all(
        group.members.map(member => 
          redis.del(this.getUserKey(member.userId))
        )
      );
    }
  }

  private async updateUserGroupsCache(group: GroupTrip): Promise<void> {
    await Promise.all(
      group.members.map(async member => {
        const userGroups = await this.getUserGroups(member.userId) || [];
        const updatedGroups = userGroups
          .filter(g => g.id !== group.id)
          .concat(group);
        await redis.setex(
          this.getUserKey(member.userId),
          this.ttl,
          JSON.stringify(updatedGroups)
        );
      })
    );
  }

  private getKey(groupId: string): string {
    return `${this.prefix}${groupId}`;
  }

  private getUserKey(userId: string): string {
    return `${this.userPrefix}${userId}`;
  }
} 