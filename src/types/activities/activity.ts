import { ActivityMetrics } from './metrics';
import { Prisma } from '@prisma/client';

export type ActivityStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ActivityData {
  providerId: string;
  provider: string;
  userId: string;
  type: string;
  startDate: Date;
  endDate?: Date | null;
  duration: number;
  distance?: number | null;
  title?: string | null;
  description?: string | null;
  status?: ActivityStatus;
  metrics?: ActivityMetrics | null;
  rawData?: Record<string, any> | null;
}

export type ActivityInput = Omit<ActivityData, 'metrics'> & {
  providerType: string;
  userId: string;
  type: string;
  startDate: Date;
  endDate?: Date | null;
  duration: number;
  distance?: number | null;
  title?: string | null;
  description?: string | null;
  status?: string;
  metrics?: Prisma.JsonValue;
  rawData?: Prisma.JsonValue;
}; 