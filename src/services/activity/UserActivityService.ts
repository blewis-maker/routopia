import { prisma } from '@/lib/prisma';
import { Activity } from '@prisma/client';
import { ActivityMetrics } from '@/types/activities/metrics';

export class UserActivityService {
  constructor(private userId: string) {}

  async getUserActivities(): Promise<Activity[]> {
    return prisma.activity.findMany({
      where: {
        userId: this.userId
      },
      orderBy: {
        startDate: 'desc'
      }
    });
  }

  async getRecentActivities(limit: number = 5): Promise<Activity[]> {
    return prisma.activity.findMany({
      where: {
        userId: this.userId,
        status: 'completed'
      },
      orderBy: {
        startDate: 'desc'
      },
      take: limit
    });
  }

  async getActivityPreferences(): Promise<{
    preferredTypes: string[];
    averageDistance: number;
    averageDuration: number;
  }> {
    const activities = await this.getRecentActivities(10);
    
    if (!activities.length) {
      return {
        preferredTypes: [],
        averageDistance: 0,
        averageDuration: 0
      };
    }

    // Calculate preferences
    const typeCount = new Map<string, number>();
    let totalDistance = 0;
    let totalDuration = 0;

    activities.forEach(activity => {
      // Count activity types
      typeCount.set(
        activity.type,
        (typeCount.get(activity.type) || 0) + 1
      );

      // Sum metrics
      totalDistance += activity.distance || 0;
      totalDuration += activity.duration || 0;
    });

    // Get preferred types (more than one occurrence)
    const preferredTypes = Array.from(typeCount.entries())
      .filter(([_, count]) => count > 1)
      .map(([type]) => type);

    return {
      preferredTypes,
      averageDistance: totalDistance / activities.length,
      averageDuration: totalDuration / activities.length
    };
  }

  async getActivityMetrics(activityId: string): Promise<ActivityMetrics | null> {
    const activity = await prisma.activity.findUnique({
      where: { id: activityId }
    });

    if (!activity?.metrics) return null;

    return activity.metrics as unknown as ActivityMetrics;
  }

  async updateActivityMetrics(activityId: string, metrics: ActivityMetrics): Promise<void> {
    await prisma.activity.update({
      where: { id: activityId },
      data: {
        metrics: metrics as any // Type cast needed due to Prisma JSON field
      }
    });
  }

  async getActivityTrends(): Promise<{
    weeklyDistance: number;
    monthlyDistance: number;
    weeklyDuration: number;
    monthlyDuration: number;
  }> {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [weeklyActivities, monthlyActivities] = await Promise.all([
      prisma.activity.findMany({
        where: {
          userId: this.userId,
          startDate: { gte: weekAgo },
          status: 'completed'
        }
      }),
      prisma.activity.findMany({
        where: {
          userId: this.userId,
          startDate: { gte: monthAgo },
          status: 'completed'
        }
      })
    ]);

    return {
      weeklyDistance: weeklyActivities.reduce((sum, act) => sum + (act.distance || 0), 0),
      monthlyDistance: monthlyActivities.reduce((sum, act) => sum + (act.distance || 0), 0),
      weeklyDuration: weeklyActivities.reduce((sum, act) => sum + (act.duration || 0), 0),
      monthlyDuration: monthlyActivities.reduce((sum, act) => sum + (act.duration || 0), 0)
    };
  }
} 