import { ActivityProvider } from '../interfaces/ActivityProvider';
import { Activity, ActivityType, ActivityDifficulty } from '@/types/activities/activityTypes';
import { GarminAPI } from '@/lib/external/garmin';
import { prisma } from '@/lib/prisma';
import { ActivityError } from '@/lib/utils/errors/activityErrors';

export class GarminActivityProvider implements ActivityProvider {
  name = 'garmin';
  supportedActivities: ActivityType[] = [
    'running', 'cycling', 'hiking', 'swimming', 'skiing'
  ];
  private api: GarminAPI;
  private initialized = false;

  async initialize(): Promise<void> {
    this.api = await GarminAPI.initialize();
    this.initialized = true;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async getActivities(userId: string): Promise<Activity[]> {
    try {
      const garminActivities = await this.api.getUserActivities(userId);
      return garminActivities.map(this.transformActivity.bind(this));
    } catch (error) {
      await this.handleGarminError(error, 'fetch');
      return [];
    }
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
      await this.handleGarminError(error, 'sync');
    }
  }

  async trackActivity(userId: string, activity: Activity): Promise<void> {
    try {
      const garminActivity = await this.api.startActivity({
        userId,
        type: this.mapTypeToGarmin(activity.type),
        name: activity.name,
        startTime: new Date()
      });

      await prisma.activity.update({
        where: { id: activity.id },
        data: {
          providerActivityId: garminActivity.id,
          provider: this.name
        }
      });
    } catch (error) {
      await this.handleGarminError(error, 'track');
    }
  }

  private async handleGarminError(error: any, operation: string): Promise<never> {
    const message = error.response?.data?.message || error.message;
    throw new ActivityError(`Garmin ${operation} failed: ${message}`);
  }

  private transformActivity(garminActivity: any): Activity {
    return {
      id: garminActivity.activityId,
      userId: garminActivity.userId,
      type: this.mapGarminType(garminActivity.activityType),
      name: garminActivity.activityName,
      description: garminActivity.description,
      status: 'completed',
      difficulty: this.calculateDifficulty(garminActivity),
      startTime: new Date(garminActivity.startTimeLocal),
      endTime: new Date(garminActivity.endTimeLocal),
      duration: garminActivity.duration,
      distance: garminActivity.distance,
      elevation: garminActivity.elevationGain,
      averageSpeed: garminActivity.averageSpeed,
      maxSpeed: garminActivity.maxSpeed,
      metrics: {
        averageHeartRate: garminActivity.averageHeartRate,
        maxHeartRate: garminActivity.maxHeartRate,
        averageCadence: garminActivity.averageRunningCadence,
        calories: garminActivity.calories,
        steps: garminActivity.steps,
        power: garminActivity.averagePower
      }
    };
  }

  private mapGarminType(garminType: string): ActivityType {
    const typeMap: Record<string, ActivityType> = {
      'RUNNING': 'running',
      'CYCLING': 'cycling',
      'HIKING': 'hiking',
      'SWIMMING': 'swimming',
      'SKIING': 'skiing'
    };
    return typeMap[garminType] || 'walking';
  }

  private mapTypeToGarmin(type: ActivityType): string {
    const typeMap: Record<ActivityType, string> = {
      'running': 'RUNNING',
      'cycling': 'CYCLING',
      'hiking': 'HIKING',
      'walking': 'WALKING',
      'swimming': 'SWIMMING',
      'climbing': 'OTHER',
      'skiing': 'SKIING'
    };
    return typeMap[type];
  }

  private calculateDifficulty(activity: any): ActivityDifficulty {
    const metrics = {
      heartRateScore: this.calculateHeartRateScore(activity),
      paceScore: this.calculatePaceScore(activity),
      elevationScore: this.calculateElevationScore(activity)
    };

    const totalScore = Object.values(metrics).reduce((sum, score) => sum + score, 0);
    const avgScore = totalScore / Object.keys(metrics).length;

    if (avgScore >= 0.8) return 'expert';
    if (avgScore >= 0.6) return 'advanced';
    if (avgScore >= 0.4) return 'intermediate';
    return 'beginner';
  }

  private calculateHeartRateScore(activity: any): number {
    if (!activity.averageHeartRate) return 0.5;
    // Implement heart rate scoring logic
    return 0.7;
  }

  private calculatePaceScore(activity: any): number {
    if (!activity.averageSpeed) return 0.5;
    // Implement pace scoring logic
    return 0.6;
  }

  private calculateElevationScore(activity: any): number {
    if (!activity.elevationGain) return 0.5;
    // Implement elevation scoring logic
    return 0.8;
  }
} 