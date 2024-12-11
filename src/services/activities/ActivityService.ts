import { ServiceInterface, CacheableService } from '../interfaces/ServiceInterface';
import { ActivityProvider, ActivityRecommender, ActivityTracker } from './interfaces/ActivityProvider';
import { Activity, ActivityType } from '@/types/activities/activityTypes';
import { UserProfile } from '@/types/user';
import { WeatherConditions } from '@/types/weather';
import { Route } from '@/types/route/types';
import { redis } from '@/lib/redis';

export class ActivityService implements ServiceInterface, CacheableService {
  private initialized = false;
  private readonly CACHE_TTL = 3600; // 1 hour
  private providers: Map<string, ActivityProvider> = new Map();
  private recommender: ActivityRecommender;
  private tracker: ActivityTracker;

  constructor(
    recommender: ActivityRecommender,
    tracker: ActivityTracker
  ) {
    this.recommender = recommender;
    this.tracker = tracker;
  }

  async initialize(): Promise<void> {
    for (const provider of this.providers.values()) {
      await provider.initialize();
    }
    this.initialized = true;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async healthCheck(): Promise<boolean> {
    return Array.from(this.providers.values()).every(p => p.isInitialized());
  }

  registerProvider(provider: ActivityProvider): void {
    this.providers.set(provider.name, provider);
  }

  async getActivities(userId: string): Promise<Activity[]> {
    const cacheKey = this.getCacheKey({ type: 'activities', userId });
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const activities = await Promise.all(
      Array.from(this.providers.values()).map(p => p.getActivities(userId))
    );

    const merged = activities.flat();
    await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(merged));
    
    return merged;
  }

  async getRecommendations(
    user: UserProfile,
    weather: WeatherConditions,
    route?: Route
  ): Promise<Activity[]> {
    return this.recommender.getRecommendations(user, weather, route);
  }

  async startActivity(userId: string, activity: Activity): Promise<void> {
    await this.tracker.startActivity(userId, activity);
    await this.invalidateUserCache(userId);
  }

  async updateActivity(userId: string, activity: Activity): Promise<void> {
    await this.tracker.updateActivity(userId, activity);
    await this.invalidateUserCache(userId);
  }

  async endActivity(userId: string, activity: Activity): Promise<void> {
    await this.tracker.endActivity(userId, activity);
    await this.invalidateUserCache(userId);
  }

  // CacheableService implementation
  getCacheKey(params: any): string {
    const { type, userId } = params;
    return `activity:${type}:${userId}`;
  }

  getCacheTTL(): number {
    return this.CACHE_TTL;
  }

  async clearCache(): Promise<void> {
    const keys = await redis.keys('activity:*');
    if (keys.length) {
      await Promise.all(keys.map(key => redis.del(key)));
    }
  }

  private async invalidateUserCache(userId: string): Promise<void> {
    const keys = await redis.keys(`activity:*:${userId}`);
    if (keys.length) {
      await Promise.all(keys.map(key => redis.del(key)));
    }
  }
} 