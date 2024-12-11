import { Activity, Prisma } from '@prisma/client';
import { ActivityMetrics } from '@/types/activities/metrics';
import { ActivityData } from '@/types/activities/activity';

export interface ActivityWithRawData {
  id: string;
  provider: string;
  userId: string;
  type: string;
  startDate: Date;
  endDate: Date | null;
  duration: number;
  distance: number | null;
  title: string | null;
  description: string | null;
  status: string;
  metrics: Prisma.JsonValue | null;
  rawData: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
}

export class ActivityMetricsCalculator {
  constructor(private activity: ActivityWithRawData) {}

  public calculateMetrics(): ActivityMetrics {
    if (!this.activity.rawData) {
      throw new Error('Activity raw data is missing');
    }

    const rawData = this.activity.rawData as Record<string, any>;
    
    // Ensure required base metrics
    const baseMetrics: ActivityMetrics = {
      movingTime: this.getNumberValue(rawData.moving_time, 0),
      elapsedTime: this.getNumberValue(rawData.elapsed_time, 0),
      distance: this.getNumberValue(rawData.distance, 0),
      elevationGain: this.getNumberValue(rawData.total_elevation_gain, 0),
      elevationLoss: this.getNumberValue(rawData.total_elevation_loss, 0),
      averageSpeed: this.getNumberValue(rawData.average_speed, 0),
      maxSpeed: this.getNumberValue(rawData.max_speed, 0),
    };

    this.addOptionalMetrics(rawData, baseMetrics);

    return baseMetrics;
  }

  private addOptionalMetrics(rawData: Record<string, any>, metrics: ActivityMetrics): void {
    if (rawData.average_watts) {
      metrics.averagePower = this.getNumberValue(rawData.average_watts);
    }
    
    if (rawData.max_watts) {
      metrics.maxPower = this.getNumberValue(rawData.max_watts);
    }

    if (rawData.average_heartrate) {
      metrics.averageHeartRate = this.getNumberValue(rawData.average_heartrate);
    }

    if (rawData.max_heartrate) {
      metrics.maxHeartRate = this.getNumberValue(rawData.max_heartrate);
    }

    if (rawData.calories) {
      metrics.calories = this.getNumberValue(rawData.calories);
    }
  }

  private getNumberValue(value: any, defaultValue?: number): number {
    const num = Number(value);
    return isNaN(num) ? (defaultValue ?? 0) : num;
  }
} 