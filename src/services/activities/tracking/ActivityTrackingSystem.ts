import { ActivityTracker } from '../interfaces/ActivityProvider';
import { Activity, ActivityStatus, ActivityProgress } from '@/types/activities/activityTypes';
import { redis } from '@/lib/redis';
import { prisma } from '@/lib/prisma';

export class ActivityTrackingSystem implements ActivityTracker {
  private readonly TRACKING_TTL = 7200; // 2 hours

  async startActivity(userId: string, activity: Activity): Promise<void> {
    // Create activity record
    const dbActivity = await prisma.activity.create({
      data: {
        ...activity,
        status: 'in_progress',
        startTime: new Date(),
        userId
      }
    });

    // Initialize tracking in Redis
    await redis.setex(
      `tracking:${activity.id}`,
      this.TRACKING_TTL,
      JSON.stringify({
        activityId: activity.id,
        userId,
        startTime: new Date(),
        lastUpdate: new Date(),
        progress: {
          distance: 0,
          duration: 0,
          currentSpeed: 0,
          elevation: 0
        }
      })
    );
  }

  async updateActivity(userId: string, activity: Activity): Promise<void> {
    const tracking = await this.getTracking(activity.id);
    if (!tracking || tracking.userId !== userId) {
      throw new Error('Activity tracking not found or unauthorized');
    }

    // Update activity progress
    await redis.setex(
      `tracking:${activity.id}`,
      this.TRACKING_TTL,
      JSON.stringify({
        ...tracking,
        lastUpdate: new Date(),
        progress: activity.metrics
      })
    );

    // Update DB record
    await prisma.activity.update({
      where: { id: activity.id },
      data: {
        metrics: activity.metrics,
        status: activity.status
      }
    });
  }

  async endActivity(userId: string, activity: Activity): Promise<void> {
    const tracking = await this.getTracking(activity.id);
    if (!tracking || tracking.userId !== userId) {
      throw new Error('Activity tracking not found or unauthorized');
    }

    // Update final metrics and status
    await prisma.activity.update({
      where: { id: activity.id },
      data: {
        ...activity,
        status: 'completed',
        endTime: new Date()
      }
    });

    // Clear tracking data
    await redis.del(`tracking:${activity.id}`);
  }

  async getStatus(userId: string, activityId: string): Promise<ActivityStatus> {
    const tracking = await this.getTracking(activityId);
    if (!tracking || tracking.userId !== userId) {
      const dbActivity = await prisma.activity.findUnique({
        where: { id: activityId }
      });
      return dbActivity?.status || 'cancelled';
    }
    return 'in_progress';
  }

  private async getTracking(activityId: string): Promise<ActivityProgress | null> {
    const data = await redis.get(`tracking:${activityId}`);
    return data ? JSON.parse(data) : null;
  }
} 