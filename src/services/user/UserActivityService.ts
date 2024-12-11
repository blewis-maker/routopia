import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { UserPreferences, RouteHistory } from '@/types/user';

export class UserActivityService {
  // Get combined preferences (activity + route + notifications)
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    const cacheKey = `user:${userId}:preferences`;
    
    // Try Redis first
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    // Fall back to PostgreSQL and combine preferences
    const [userPrefs, routePrefs, activityPrefs] = await Promise.all([
      prisma.userPreferences.findUnique({ where: { userId } }),
      prisma.routePreferences.findUnique({ where: { userId } }),
      prisma.activityPreferences.findUnique({ where: { userId } })
    ]);

    if (!userPrefs) return null;

    // Combine all preferences
    const combinedPrefs = {
      ...userPrefs,
      routePreferences: routePrefs,
      activityPreferences: activityPrefs
    };

    // Cache combined preferences
    await redis.setex(cacheKey, 3600, JSON.stringify(combinedPrefs));

    return combinedPrefs;
  }

  async updateUserPreferences(userId: string, updates: Partial<UserPreferences>): Promise<void> {
    const { routePreferences, activityPreferences, ...userPrefs } = updates;

    // Update each preference model
    await Promise.all([
      prisma.userPreferences.upsert({
        where: { userId },
        update: userPrefs,
        create: { userId, ...userPrefs }
      }),
      routePreferences && prisma.routePreferences.upsert({
        where: { userId },
        update: routePreferences,
        create: { userId, ...routePreferences }
      }),
      activityPreferences && prisma.activityPreferences.upsert({
        where: { userId },
        update: activityPreferences,
        create: { userId, ...activityPreferences }
      })
    ]);

    // Invalidate cache
    await redis.del(`user:${userId}:preferences`);
  }

  async storeRouteHistory(userId: string, route: RouteHistory): Promise<void> {
    // Store in PostgreSQL
    await prisma.routeHistory.create({
      data: {
        userId,
        startPoint: route.startPoint,
        endPoint: route.endPoint,
        activityType: route.activityType,
        distance: route.distance,
        duration: route.duration,
        weather: route.weather,
        rating: route.rating,
        timestamp: new Date()
      }
    });

    // Update recent routes cache
    const cacheKey = `user:${userId}:recent_routes`;
    await redis.lpush(cacheKey, JSON.stringify(route));
    await redis.ltrim(cacheKey, 0, 9); // Keep only last 10 routes
  }

  async getRecentRoutes(userId: string, limit: number = 5): Promise<RouteHistory[]> {
    const cacheKey = `user:${userId}:recent_routes`;
    
    // Try Redis first
    const cached = await redis.lrange(cacheKey, 0, limit - 1);
    if (cached.length > 0) {
      return cached.map(route => JSON.parse(route));
    }

    // Fall back to PostgreSQL
    const routes = await prisma.routeHistory.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit
    });

    // Cache results
    if (routes.length > 0) {
      await redis.del(cacheKey);
      await Promise.all(
        routes.map(route => redis.lpush(cacheKey, JSON.stringify(route)))
      );
    }

    return routes;
  }
} 