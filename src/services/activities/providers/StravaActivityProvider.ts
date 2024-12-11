import { ActivityProvider } from '../interfaces/ActivityProvider';
import { Activity, ActivityType } from '@/types/activities/activityTypes';
import { StravaAPI } from '@/lib/external/strava';
import { prisma } from '@/lib/prisma';
import { ActivityError } from '@/lib/utils/errors/activityErrors';

export class StravaActivityProvider implements ActivityProvider {
  name = 'strava';
  supportedActivities: ActivityType[] = ['cycling', 'running', 'hiking'];
  private api: StravaAPI;
  private initialized = false;

  async initialize(): Promise<void> {
    this.api = await StravaAPI.initialize();
    this.initialized = true;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async getActivities(userId: string): Promise<Activity[]> {
    const stravaActivities = await this.api.getAthleteActivities(userId);
    return stravaActivities.map(this.transformActivity);
  }

  private async handleStravaError(error: any, operation: string): Promise<never> {
    const message = error.response?.data?.message || error.message;
    throw new ActivityError(`Strava ${operation} failed: ${message}`);
  }

  async syncActivities(userId: string): Promise<void> {
    try {
      const activities = await this.getActivities(userId);
      await prisma.$transaction(
        activities.map(activity =>
          prisma.activity.upsert({
            where: { 
              provider_activityId: {
                provider: this.name,
                activityId: activity.id
              }
            },
            create: {
              ...activity,
              provider: this.name,
              userId
            },
            update: {
              ...activity,
              userId
            }
          })
        )
      );
    } catch (error) {
      await this.handleStravaError(error, 'sync');
    }
  }

  async trackActivity(userId: string, activity: Activity): Promise<void> {
    // Implement real-time activity tracking with Strava
    const stravaActivity = await this.api.createActivity(activity);
    // Update local tracking
    await prisma.activity.update({
      where: { id: activity.id },
      data: {
        providerActivityId: stravaActivity.id,
        provider: this.name
      }
    });
  }

  private transformActivity(stravaActivity: any): Activity {
    return {
      id: stravaActivity.id.toString(),
      userId: this.userId,
      provider: 'strava',
      providerActivityId: stravaActivity.id.toString(),
      type: this.mapActivityType(stravaActivity.type),
      name: stravaActivity.name,
      description: stravaActivity.description,
      status: 'completed',
      difficulty: this.calculateDifficulty(stravaActivity),
      startTime: new Date(stravaActivity.start_date),
      endTime: new Date(stravaActivity.end_date),
      distance: stravaActivity.distance,
      duration: stravaActivity.moving_time,
      elevation: stravaActivity.total_elevation_gain,
      averageSpeed: stravaActivity.average_speed,
      maxSpeed: stravaActivity.max_speed,
      metrics: {
        averageHeartrate: stravaActivity.average_heartrate,
        maxHeartrate: stravaActivity.max_heartrate,
        cadence: stravaActivity.average_cadence,
        power: stravaActivity.average_watts
      }
    };
  }

  private mapActivityType(stravaType: string): ActivityType {
    const typeMap: Record<string, ActivityType> = {
      'Ride': 'cycling',
      'Run': 'running',
      'Hike': 'hiking'
    };
    return typeMap[stravaType] || 'walking';
  }

  private calculateDifficulty(activity: any): ActivityDifficulty {
    // Implement difficulty calculation based on metrics
    return 'intermediate';
  }
} 