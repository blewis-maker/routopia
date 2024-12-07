import axios from 'axios';

export interface Activity {
  id: string;
  userId: string;
  type: ActivityType;
  distance: number;
  duration: number;
  startTime: string;
  endTime: string;
  route?: {
    id: string;
    name: string;
  };
  stats: {
    averageSpeed: number;
    maxSpeed: number;
    elevationGain: number;
    calories: number;
  };
  createdAt: string;
  updatedAt: string;
}

export type ActivityType = 'running' | 'cycling' | 'walking' | 'hiking';

export interface CreateActivityParams {
  type: ActivityType;
  distance: number;
  duration: number;
  startTime: string;
  endTime: string;
  routeId?: string;
  stats: {
    averageSpeed: number;
    maxSpeed: number;
    elevationGain: number;
    calories: number;
  };
}

class ActivityService {
  private api;

  constructor() {
    this.api = axios.create({
      baseURL: '/api/activities',
    });
  }

  async getActivities(): Promise<Activity[]> {
    try {
      const { data } = await this.api.get<Activity[]>('/');
      return data;
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw new Error('Failed to fetch activities');
    }
  }

  async getActivity(id: string): Promise<Activity> {
    try {
      const { data } = await this.api.get<Activity>(`/${id}`);
      return data;
    } catch (error) {
      console.error('Error fetching activity:', error);
      throw new Error('Failed to fetch activity');
    }
  }

  async createActivity(params: CreateActivityParams): Promise<Activity> {
    try {
      const { data } = await this.api.post<Activity>('/', params);
      return data;
    } catch (error) {
      console.error('Error creating activity:', error);
      throw new Error('Failed to create activity');
    }
  }

  async deleteActivity(id: string): Promise<void> {
    try {
      await this.api.delete(`/${id}`);
    } catch (error) {
      console.error('Error deleting activity:', error);
      throw new Error('Failed to delete activity');
    }
  }

  async getStats(timeframe: 'week' | 'month' | 'year'): Promise<ActivityStats> {
    try {
      const { data } = await this.api.get<ActivityStats>('/stats', {
        params: { timeframe },
      });
      return data;
    } catch (error) {
      console.error('Error fetching activity stats:', error);
      throw new Error('Failed to fetch activity stats');
    }
  }
}

export interface ActivityStats {
  totalDistance: number;
  totalDuration: number;
  totalActivities: number;
  byType: Record<ActivityType, {
    count: number;
    distance: number;
    duration: number;
  }>;
}

export const activityService = new ActivityService(); 