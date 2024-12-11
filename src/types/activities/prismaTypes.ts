import { Prisma } from '@prisma/client';
import { ActivityMetrics } from './metrics';

export type ActivityMetricsJson = Prisma.JsonValue & ActivityMetrics;
export type ActivityRawDataJson = Prisma.JsonValue & Record<string, any>;

// Type guard for ActivityMetrics
export function isActivityMetrics(json: any): json is ActivityMetrics {
  return (
    json &&
    typeof json.movingTime === 'number' &&
    typeof json.elapsedTime === 'number' &&
    typeof json.distance === 'number' &&
    typeof json.elevationGain === 'number' &&
    typeof json.elevationLoss === 'number' &&
    typeof json.averageSpeed === 'number' &&
    typeof json.maxSpeed === 'number'
  );
} 