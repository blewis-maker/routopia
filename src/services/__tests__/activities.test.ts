import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';
import {
  getActivitiesByType,
  getActivityStats,
  createActivity,
  updateActivity
} from '../activities';
import type { ActivityType, ActivityMetrics } from '@/types/activities';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    activity: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn()
    }
  }
}));

describe('Activities Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getActivitiesByType', () => {
    it('should fetch activities for the given type and timeframe', async () => {
      const mockActivities = [
        {
          id: '1',
          type: 'BIKE',
          date: new Date(),
          metrics: {
            distance: 20,
            duration: 3600,
            speed: 20,
            calories: 500
          }
        }
      ];

      vi.mocked(prisma.activity.findMany).mockResolvedValue(mockActivities);

      const result = await getActivitiesByType('BIKE' as ActivityType, 'week');

      expect(prisma.activity.findMany).toHaveBeenCalledWith({
        where: {
          type: 'BIKE',
          date: {
            gte: expect.any(Date)
          }
        },
        orderBy: {
          date: 'desc'
        },
        include: {
          metrics: true
        }
      });

      expect(result).toEqual(mockActivities);
    });
  });

  describe('getActivityStats', () => {
    it('should calculate stats for the given type and timeframe', async () => {
      const mockActivities = [
        {
          id: '1',
          type: 'BIKE',
          date: new Date(),
          metrics: {
            distance: 20,
            duration: 3600,
            speed: 20,
            calories: 500
          }
        }
      ];

      vi.mocked(prisma.activity.findMany).mockResolvedValue(mockActivities);

      const result = await getActivityStats('BIKE' as ActivityType, 'week');

      expect(prisma.activity.findMany).toHaveBeenCalledWith({
        where: {
          type: 'BIKE',
          date: {
            gte: expect.any(Date)
          }
        },
        include: {
          metrics: true
        }
      });

      expect(result).toEqual({
        type: 'BIKE',
        count: 1,
        totalDistance: 20,
        totalDuration: 3600,
        averageSpeed: 20,
        lastActivity: {
          date: expect.any(String),
          metrics: mockActivities[0].metrics
        }
      });
    });
  });

  describe('createActivity', () => {
    it('should create a new activity with metrics', async () => {
      const mockMetrics: ActivityMetrics = {
        distance: 20,
        duration: 3600,
        speed: 20,
        calories: 500,
        heartRate: {
          average: 145,
          max: 175
        }
      };

      const mockActivity = {
        id: '1',
        type: 'BIKE',
        date: new Date(),
        metrics: mockMetrics
      };

      vi.mocked(prisma.activity.create).mockResolvedValue(mockActivity);

      const result = await createActivity('BIKE' as ActivityType, mockMetrics);

      expect(prisma.activity.create).toHaveBeenCalledWith({
        data: {
          type: 'BIKE',
          date: expect.any(Date),
          metrics: {
            create: mockMetrics
          }
        },
        include: {
          metrics: true
        }
      });

      expect(result).toEqual(mockActivity);
    });
  });

  describe('updateActivity', () => {
    it('should update activity metrics', async () => {
      const mockMetrics: Partial<ActivityMetrics> = {
        distance: 25,
        duration: 4000
      };

      const mockActivity = {
        id: '1',
        type: 'BIKE',
        date: new Date(),
        metrics: {
          ...mockMetrics,
          speed: 22.5,
          calories: 600
        }
      };

      vi.mocked(prisma.activity.update).mockResolvedValue(mockActivity);

      const result = await updateActivity('1', mockMetrics);

      expect(prisma.activity.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          metrics: {
            update: mockMetrics
          }
        },
        include: {
          metrics: true
        }
      });

      expect(result).toEqual(mockActivity);
    });
  });
}); 