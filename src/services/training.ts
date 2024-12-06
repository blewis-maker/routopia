import { prisma } from '@/lib/prisma';
import { ActivityType } from '@/types/activity';
import type { ActivityMetrics } from './activities';

export type Workout = {
  id: string;
  type: ActivityType;
  scheduledDate: string;
  notes?: string;
  targetMetrics: ActivityMetrics;
  actualMetrics?: ActivityMetrics;
};

export type TrainingPlan = {
  id: string;
  type: ActivityType;
  name: string;
  startDate: string;
  endDate: string;
  workouts: Workout[];
  goal: string;
};

export async function getTrainingPlan(type: ActivityType) {
  const plan = await prisma.trainingPlan.findFirst({
    where: {
      type,
      endDate: {
        gte: new Date(),
      },
    },
    include: {
      workouts: {
        include: {
          targetMetrics: true,
          actualMetrics: true,
        },
      },
    },
    orderBy: {
      startDate: 'asc',
    },
  });

  if (!plan) return null;

  return {
    id: plan.id,
    type: plan.type as ActivityType,
    name: plan.name,
    startDate: plan.startDate.toISOString(),
    endDate: plan.endDate.toISOString(),
    goal: plan.goal,
    workouts: plan.workouts.map(workout => ({
      id: workout.id,
      type: workout.type as ActivityType,
      scheduledDate: workout.scheduledDate.toISOString(),
      notes: workout.notes || undefined,
      targetMetrics: {
        distance: workout.targetMetrics.distance,
        duration: workout.targetMetrics.duration,
        speed: workout.targetMetrics.speed,
        calories: workout.targetMetrics.calories,
        heartRate: workout.targetMetrics.heartRate as { average: number; max: number } | undefined,
        cadence: workout.targetMetrics.cadence || undefined,
        power: workout.targetMetrics.power || undefined,
      },
      actualMetrics: workout.actualMetrics ? {
        distance: workout.actualMetrics.distance,
        duration: workout.actualMetrics.duration,
        speed: workout.actualMetrics.speed,
        calories: workout.actualMetrics.calories,
        heartRate: workout.actualMetrics.heartRate as { average: number; max: number } | undefined,
        cadence: workout.actualMetrics.cadence || undefined,
        power: workout.actualMetrics.power || undefined,
      } : undefined,
    })),
  };
}

export async function createTrainingPlan(plan: Omit<TrainingPlan, 'id'>) {
  return prisma.trainingPlan.create({
    data: {
      type: plan.type,
      name: plan.name,
      startDate: new Date(plan.startDate),
      endDate: new Date(plan.endDate),
      goal: plan.goal,
      workouts: {
        create: plan.workouts.map(workout => ({
          type: workout.type,
          scheduledDate: new Date(workout.scheduledDate),
          notes: workout.notes,
          targetMetrics: {
            create: {
              distance: workout.targetMetrics.distance,
              duration: workout.targetMetrics.duration,
              speed: workout.targetMetrics.speed,
              calories: workout.targetMetrics.calories,
              heartRate: workout.targetMetrics.heartRate || null,
              cadence: workout.targetMetrics.cadence || null,
              power: workout.targetMetrics.power || null,
            },
          },
        })),
      },
    },
    include: {
      workouts: {
        include: {
          targetMetrics: true,
          actualMetrics: true,
        },
      },
    },
  });
}

export async function getWorkouts(type: ActivityType, includeCompleted = false) {
  const workouts = await prisma.workout.findMany({
    where: {
      type,
      scheduledDate: includeCompleted ? undefined : {
        gte: new Date(),
      },
    },
    include: {
      targetMetrics: true,
      actualMetrics: true,
    },
    orderBy: {
      scheduledDate: 'asc',
    },
  });

  return workouts.map(workout => ({
    id: workout.id,
    type: workout.type as ActivityType,
    scheduledDate: workout.scheduledDate.toISOString(),
    notes: workout.notes || undefined,
    targetMetrics: {
      distance: workout.targetMetrics.distance,
      duration: workout.targetMetrics.duration,
      speed: workout.targetMetrics.speed,
      calories: workout.targetMetrics.calories,
      heartRate: workout.targetMetrics.heartRate as { average: number; max: number } | undefined,
      cadence: workout.targetMetrics.cadence || undefined,
      power: workout.targetMetrics.power || undefined,
    },
    actualMetrics: workout.actualMetrics ? {
      distance: workout.actualMetrics.distance,
      duration: workout.actualMetrics.duration,
      speed: workout.actualMetrics.speed,
      calories: workout.actualMetrics.calories,
      heartRate: workout.actualMetrics.heartRate as { average: number; max: number } | undefined,
      cadence: workout.actualMetrics.cadence || undefined,
      power: workout.actualMetrics.power || undefined,
    } : undefined,
  }));
}

export async function updateWorkout(workout: Workout) {
  return prisma.workout.update({
    where: { id: workout.id },
    data: {
      notes: workout.notes,
      actualMetrics: {
        upsert: {
          create: {
            distance: workout.actualMetrics!.distance,
            duration: workout.actualMetrics!.duration,
            speed: workout.actualMetrics!.speed,
            calories: workout.actualMetrics!.calories,
            heartRate: workout.actualMetrics!.heartRate || null,
            cadence: workout.actualMetrics!.cadence || null,
            power: workout.actualMetrics!.power || null,
          },
          update: {
            distance: workout.actualMetrics!.distance,
            duration: workout.actualMetrics!.duration,
            speed: workout.actualMetrics!.speed,
            calories: workout.actualMetrics!.calories,
            heartRate: workout.actualMetrics!.heartRate || null,
            cadence: workout.actualMetrics!.cadence || null,
            power: workout.actualMetrics!.power || null,
          },
        },
      },
    },
    include: {
      targetMetrics: true,
      actualMetrics: true,
    },
  });
} 