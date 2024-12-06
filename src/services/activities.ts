import { prisma } from '@/lib/prisma';
import { ActivityType } from '@/types/activity';

export type ActivityMetrics = {
  distance: number;
  duration: number;
  speed: number;
  calories: number;
  elevation?: number;
  heartRate?: {
    average: number;
    max: number;
  };
  cadence?: number;
  power?: number;
};

export type ActivityTimeframe = 'day' | 'week' | 'month' | 'year';

function getTimeframeStartDate(timeframe: ActivityTimeframe): Date {
  const now = new Date();
  switch (timeframe) {
    case 'day':
      return new Date(now.setHours(0, 0, 0, 0));
    case 'week':
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      return weekStart;
    case 'month':
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case 'year':
      return new Date(now.getFullYear(), 0, 1);
  }
}

export async function getActivitiesByType(type: ActivityType, timeframe: ActivityTimeframe) {
  const startDate = getTimeframeStartDate(timeframe);

  const activities = await prisma.activity.findMany({
    where: {
      type,
      date: {
        gte: startDate,
      },
    },
    include: {
      metrics: true,
    },
    orderBy: {
      date: 'desc',
    },
  });

  return activities.map(activity => ({
    id: activity.id,
    type: activity.type as ActivityType,
    date: activity.date.toISOString(),
    metrics: {
      distance: activity.metrics.distance,
      duration: activity.metrics.duration,
      speed: activity.metrics.speed,
      calories: activity.metrics.calories,
      heartRate: activity.metrics.heartRate as { average: number; max: number } | undefined,
      cadence: activity.metrics.cadence,
      power: activity.metrics.power,
    },
  }));
}

export async function getActivityStats(type: ActivityType, timeframe: ActivityTimeframe) {
  const startDate = getTimeframeStartDate(timeframe);

  const activities = await prisma.activity.findMany({
    where: {
      type,
      date: {
        gte: startDate,
      },
    },
    include: {
      metrics: true,
    },
  });

  return activities.reduce((sum, activity) => {
    return {
      totalDistance: sum.totalDistance + activity.metrics.distance,
      totalDuration: sum.totalDuration + activity.metrics.duration,
      totalCalories: sum.totalCalories + activity.metrics.calories,
      activityCount: sum.activityCount + 1,
    };
  }, {
    totalDistance: 0,
    totalDuration: 0,
    totalCalories: 0,
    activityCount: 0,
  });
}

export async function getLatestActivity(type: ActivityType) {
  const activity = await prisma.activity.findFirst({
    where: { type },
    include: {
      metrics: true,
    },
    orderBy: {
      date: 'desc',
    },
  });

  if (!activity) return undefined;

  return {
    date: activity.date.toISOString(),
    metrics: {
      distance: activity.metrics.distance,
      duration: activity.metrics.duration,
      speed: activity.metrics.speed,
      calories: activity.metrics.calories,
      heartRate: activity.metrics.heartRate as { average: number; max: number } | undefined,
      cadence: activity.metrics.cadence,
      power: activity.metrics.power,
    },
  };
}

export async function createActivity(type: ActivityType, metrics: ActivityMetrics) {
  return prisma.activity.create({
    data: {
      type,
      metrics: {
        create: {
          distance: metrics.distance,
          duration: metrics.duration,
          speed: metrics.speed,
          calories: metrics.calories,
          heartRate: metrics.heartRate || null,
          cadence: metrics.cadence || null,
          power: metrics.power || null,
        },
      },
    },
    include: {
      metrics: true,
    },
  });
}

export async function updateActivity(id: string, metrics: Partial<ActivityMetrics>) {
  return prisma.activity.update({
    where: { id },
    data: {
      metrics: {
        update: {
          ...metrics,
          heartRate: metrics.heartRate || undefined,
        },
      },
    },
    include: {
      metrics: true,
    },
  });
} 