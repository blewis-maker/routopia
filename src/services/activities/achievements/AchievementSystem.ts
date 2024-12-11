import { Achievement, Activity, ActivityType } from '@/types/activities/activityTypes';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

export class AchievementSystem {
  private readonly CACHE_TTL = 3600; // 1 hour

  async checkAchievements(userId: string, activity: Activity): Promise<Achievement[]> {
    const eligibleAchievements = await this.getEligibleAchievements(
      userId,
      activity.type
    );

    const newAchievements = await Promise.all(
      eligibleAchievements.map(async achievement => {
        if (await this.evaluateAchievement(activity, achievement)) {
          await this.grantAchievement(userId, achievement.id);
          return achievement;
        }
        return null;
      })
    );

    return newAchievements.filter((a): a is Achievement => a !== null);
  }

  private async getEligibleAchievements(
    userId: string,
    activityType: ActivityType
  ): Promise<Achievement[]> {
    const cacheKey = `achievements:eligible:${userId}:${activityType}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const achievements = await prisma.achievement.findMany({
      where: {
        type: activityType,
        NOT: {
          userAchievements: {
            some: {
              userId
            }
          }
        }
      }
    });

    await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(achievements));
    return achievements;
  }

  private async evaluateAchievement(
    activity: Activity,
    achievement: Achievement
  ): Promise<boolean> {
    const value = activity.metrics[achievement.criteria.metric];
    if (typeof value !== 'number') return false;

    switch (achievement.criteria.operator) {
      case 'gt': return value > achievement.criteria.value;
      case 'lt': return value < achievement.criteria.value;
      case 'eq': return value === achievement.criteria.value;
      case 'gte': return value >= achievement.criteria.value;
      case 'lte': return value <= achievement.criteria.value;
      default: return false;
    }
  }

  private async grantAchievement(userId: string, achievementId: string): Promise<void> {
    await prisma.userAchievement.create({
      data: {
        userId,
        achievementId,
        earnedAt: new Date()
      }
    });

    // Invalidate cache
    await redis.del(`achievements:eligible:${userId}:*`);
  }
} 