import { Activity, Prisma } from '@prisma/client';
import { ActivityTransformer, TransformerError, ValidationResult } from '@/types/activities/transformer';
import { ActivityMetrics } from '@/types/activities/metrics';
import { ActivityMetricsCalculator, ActivityWithRawData } from '../metrics/ActivityMetricsCalculator';
import { ActivityData, ActivityInput } from '@/types/activities/activity';

export class StravaActivityTransformer implements ActivityTransformer {
  private readonly ACTIVITY_TYPE_MAP: Record<string, string> = {
    // Basic Activities
    'Ride': 'ride',
    'Run': 'run',
    'Swim': 'swim',
    'Walk': 'walk',
    'Hike': 'hike',
    
    // Winter Sports
    'AlpineSki': 'ski',
    'BackcountrySki': 'ski',
    'NordicSki': 'nordic_ski',
    'Snowboard': 'snowboard',
    'Snowshoe': 'snowshoe',
    
    // Indoor Activities
    'Workout': 'workout',
    'Yoga': 'yoga',
    'CrossFit': 'crossfit',
    'WeightTraining': 'weight_training',
    'Elliptical': 'elliptical',
    'RockClimbing': 'climbing',
    
    // Water Sports
    'Kayaking': 'kayak',
    'Rowing': 'row',
    'Surfing': 'surf',
    'StandUpPaddling': 'sup',
    
    // Other Sports
    'Golf': 'golf',
    'Tennis': 'tennis',
    'Soccer': 'soccer'
  };

  transform(rawData: Record<string, any>): ActivityInput {
    this.validateRequired(rawData);
    const metrics = this.calculateMetrics(rawData);
    
    if (!this.validateMetrics(metrics)) {
      throw new TransformerError('Invalid metrics calculated from activity data');
    }

    return {
      providerId: rawData.id.toString(),
      provider: 'strava',
      userId: rawData.athlete.id.toString(),
      type: this.mapActivityType(rawData.type),
      startDate: new Date(rawData.start_date),
      endDate: rawData.end_date ? new Date(rawData.end_date) : null,
      duration: rawData.elapsed_time,
      distance: rawData.distance,
      title: rawData.name,
      description: rawData.description,
      status: 'pending',
      metrics: metrics as unknown as Prisma.JsonValue,
      rawData: rawData as unknown as Prisma.JsonValue,
    };
  }

  validateRequired(data: Record<string, any>): boolean {
    const required = ['id', 'type', 'start_date', 'elapsed_time', 'athlete'];
    const missing = required.filter(field => !data[field]);
    
    if (missing.length > 0) {
      throw new TransformerError(
        `Missing required fields: ${missing.join(', ')}`,
        'required_fields',
        missing
      );
    }

    return true;
  }

  validateMetrics(metrics: ActivityMetrics): boolean {
    const requiredMetrics = ['movingTime', 'elapsedTime', 'distance'];
    const missing = requiredMetrics.filter(field => metrics[field as keyof ActivityMetrics] === undefined);
    
    if (missing.length > 0) {
      throw new TransformerError(
        `Missing required metrics: ${missing.join(', ')}`,
        'required_metrics',
        missing
      );
    }

    // Validate numeric values
    const numericFields = Object.entries(metrics).filter(([_, value]) => typeof value === 'number');
    const invalidFields = numericFields.filter(([_, value]) => isNaN(value) || value < 0);
    
    if (invalidFields.length > 0) {
      throw new TransformerError(
        `Invalid metric values: ${invalidFields.map(([field]) => field).join(', ')}`,
        'invalid_metrics',
        invalidFields
      );
    }

    return true;
  }

  calculateMetrics(data: Record<string, any>): ActivityMetrics {
    try {
      // Create a properly typed temporary activity for metrics calculation
      const tempActivity: ActivityWithRawData = {
        id: 'temp',
        provider: 'strava',
        userId: data.athlete.id.toString(),
        type: this.mapActivityType(data.type),
        startDate: new Date(data.start_date),
        endDate: data.end_date ? new Date(data.end_date) : null,
        duration: Number(data.elapsed_time),
        distance: data.distance ? Number(data.distance) : null,
        title: data.name || null,
        description: data.description || null,
        status: 'pending',
        metrics: null,
        rawData: JSON.parse(JSON.stringify(data)), // Ensure proper JSON serialization
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const calculator = new ActivityMetricsCalculator(tempActivity);
      return calculator.calculateMetrics();
    } catch (error) {
      throw new TransformerError(
        `Failed to calculate metrics: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'metrics_calculation'
      );
    }
  }

  private mapActivityType(stravaType: string): string {
    const mappedType = this.ACTIVITY_TYPE_MAP[stravaType];
    if (!mappedType) {
      console.warn(`Unknown activity type: ${stravaType}, defaulting to 'other'`);
      return 'other';
    }
    return mappedType;
  }
} 