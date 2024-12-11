import { PrismaClient, Activity, Prisma } from '@prisma/client';
import { ActivityInput } from '@/types/activities/activity';

interface SyncActivityParams {
  userId: string;
  provider: string;
  activityData: Record<string, any>;
}

interface SyncResult {
  status: 'success' | 'skipped' | 'failed';
  activity?: Activity;
  error?: Error;
}

export class ActivitySyncService {
  constructor(private readonly prisma: PrismaClient) {}

  async syncActivity({ userId, provider, activityData }: SyncActivityParams): Promise<SyncResult> {
    try {
      const activityInput = {
        provider: provider,
        providerActivityId: activityData.id.toString(),
        user: { connect: { id: userId } },
        type: activityData.type,
        startTime: new Date(activityData.start_date),
        endTime: activityData.end_date ? new Date(activityData.end_date) : null,
        duration: activityData.elapsed_time,
        distance: activityData.distance,
        name: activityData.name,
        description: activityData.description,
        status: 'pending',
        metrics: activityData.metrics ? (activityData.metrics as Prisma.InputJsonValue) : null,
        rawData: activityData ? (activityData as Prisma.InputJsonValue) : null
      };

      const activity = await this.prisma.activity.create({
        data: activityInput
      });

      await this.prisma.syncLog.create({
        data: {
          user: { connect: { id: userId } },
          activity: { connect: { id: activity.id } },
          provider,
          status: 'success',
          startTime: new Date(),
          completedAt: new Date()
        }
      });

      return { status: 'success', activity };
    } catch (error) {
      await Promise.all([
        this.prisma.errorLog.create({
          data: {
            name: error instanceof Error ? error.name : 'SyncError',
            message: error instanceof Error ? error.message : 'Unknown error',
            userId,
            provider,
            severity: 'error',
            metadata: activityData ? (activityData as Prisma.InputJsonValue) : null
          }
        }),
        this.prisma.syncLog.create({
          data: {
            user: { connect: { id: userId } },
            provider,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            startTime: new Date()
          }
        })
      ]);

      return { 
        status: 'failed', 
        error: error instanceof Error ? error : new Error('Unknown error')
      };
    }
  }

  async createActivity(input: ActivityInput): Promise<Activity> {
    return this.prisma.activity.create({
      data: {
        providerId: input.providerId,
        providerType: input.providerType,
        userId: input.userId,
        type: input.type,
        startDate: input.startDate,
        endDate: input.endDate,
        duration: input.duration,
        distance: input.distance,
        title: input.title,
        description: input.description,
        status: input.status || 'pending',
        metrics: input.metrics as Prisma.JsonValue,
        rawData: input.rawData as Prisma.JsonValue,
      },
    });
  }
} 