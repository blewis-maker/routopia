import type { SkiResort, LiftStatus } from '@/types/services';

export class SkiAPIService {
  async getResortInfo(resortId: string): Promise<SkiResort> {
    try {
      const response = await fetch(`/api/resorts/${resortId}`);
      if (!response.ok) throw new Error('Resort service error');
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch resort info:', error);
      return {
        stats: {
          openLifts: 0,
          totalLifts: 0,
          snowDepth: 0
        }
      };
    }
  }

  async getLiftStatus(resortId: string): Promise<LiftStatus[]> {
    try {
      const response = await fetch(`/api/resorts/${resortId}/lifts`);
      if (!response.ok) throw new Error('Lift status error');
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch lift status:', error);
      return [];
    }
  }

  async getSnowReport(resortId: string): Promise<{ conditions: string }> {
    try {
      const response = await fetch(`/api/resorts/${resortId}/snow`);
      if (!response.ok) throw new Error('Snow report error');
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch snow report:', error);
      return { conditions: 'unknown' };
    }
  }
} 