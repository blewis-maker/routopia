import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';
import {
  getTrainingPlan,
  createTrainingPlan,
  updateTrainingPlan,
  getWorkouts,
  createWorkout,
  updateWorkout
} from '../training';
import type { ActivityType, TrainingPlan, Workout } from '@/types/activities';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    trainingPlan: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn()
    },
    workout: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn()
    }
  }
}));

describe('Training Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTrainingPlan', () => {
    it('should fetch active training plan for the given type', async () => {
      const mockPlan = {
        id: '1',
        name: 'Bike Training',
        type: 'BIKE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        goal: 'Improve endurance',
        workouts: []
      };

      vi.mocked(prisma.trainingPlan.findFirst).mockResolvedValue(mockPlan);

      const result = await getTrainingPlan('BIKE' as ActivityType);

      expect(prisma.trainingPlan.findFirst).toHaveBeenCalledWith({
        where: {
          type: 'BIKE',
          endDate: {
            gte: expect.any(Date)
          }
        },
        include: {
          workouts: {
            orderBy: {
              scheduledDate: 'asc'
            }
          }
        }
      });

      expect(result).toEqual(mockPlan);
    });
  });

  describe('createTrainingPlan', () => {
    it('should create a new training plan with workouts', async () => {
      const mockPlan: Omit<TrainingPlan, 'id'> = {
        name: 'Bike Training',
        type: 'BIKE' as ActivityType,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        goal: 'Improve endurance',
        workouts: [
          {
            type: 'BIKE' as ActivityType,
            scheduledDate: new Date().toISOString(),
            targetMetrics: {
              distance: 20,
              duration: 3600,
              speed: 20,
              calories: 500
            }
          }
        ]
      };

      const mockCreatedPlan = {
        id: '1',
        ...mockPlan
      };

      vi.mocked(prisma.trainingPlan.create).mockResolvedValue(mockCreatedPlan);

      const result = await createTrainingPlan(mockPlan);

      expect(prisma.trainingPlan.create).toHaveBeenCalledWith({
        data: {
          ...mockPlan,
          workouts: {
            create: mockPlan.workouts.map(workout => ({
              ...workout,
              targetMetrics: {
                create: workout.targetMetrics
              }
            }))
          }
        },
        include: {
          workouts: {
            include: {
              targetMetrics: true,
              actualMetrics: true
            }
          }
        }
      });

      expect(result).toEqual(mockCreatedPlan);
    });
  });

  describe('getWorkouts', () => {
    it('should fetch upcoming workouts for the given type', async () => {
      const mockWorkouts = [
        {
          id: '1',
          type: 'BIKE',
          scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          targetMetrics: {
            distance: 20,
            duration: 3600,
            speed: 20,
            calories: 500
          }
        }
      ];

      vi.mocked(prisma.workout.findMany).mockResolvedValue(mockWorkouts);

      const result = await getWorkouts('BIKE' as ActivityType, true);

      expect(prisma.workout.findMany).toHaveBeenCalledWith({
        where: {
          type: 'BIKE',
          scheduledDate: {
            gte: expect.any(Date)
          }
        },
        orderBy: {
          scheduledDate: 'asc'
        },
        include: {
          targetMetrics: true,
          actualMetrics: true
        }
      });

      expect(result).toEqual(mockWorkouts);
    });
  });

  describe('updateWorkout', () => {
    it('should update workout with actual metrics', async () => {
      const mockWorkout: Workout = {
        id: '1',
        type: 'BIKE' as ActivityType,
        scheduledDate: new Date().toISOString(),
        targetMetrics: {
          distance: 20,
          duration: 3600,
          speed: 20,
          calories: 500
        },
        actualMetrics: {
          distance: 22,
          duration: 3800,
          speed: 21,
          calories: 550
        }
      };

      vi.mocked(prisma.workout.update).mockResolvedValue(mockWorkout);

      const result = await updateWorkout(mockWorkout);

      expect(prisma.workout.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          type: mockWorkout.type,
          scheduledDate: mockWorkout.scheduledDate,
          notes: undefined,
          actualMetrics: {
            upsert: {
              create: mockWorkout.actualMetrics,
              update: mockWorkout.actualMetrics
            }
          }
        },
        include: {
          targetMetrics: true,
          actualMetrics: true
        }
      });

      expect(result).toEqual(mockWorkout);
    });
  });
}); 