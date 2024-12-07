import { useState, useCallback, useEffect } from 'react';
import { 
  activityService, 
  Activity, 
  ActivityStats, 
  CreateActivityParams 
} from '@/services/api/activities';

interface UseActivitiesOptions {
  autoLoad?: boolean;
}

export function useActivities({ autoLoad = true }: UseActivitiesOptions = {}) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadActivities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await activityService.getActivities();
      setActivities(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load activities');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async (timeframe: 'week' | 'month' | 'year' = 'week') => {
    setLoading(true);
    setError(null);
    try {
      const data = await activityService.getStats(timeframe);
      setStats(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load stats');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const createActivity = useCallback(async (params: CreateActivityParams) => {
    setLoading(true);
    setError(null);
    try {
      const newActivity = await activityService.createActivity(params);
      setActivities(prev => [...prev, newActivity]);
      return newActivity;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create activity');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteActivity = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await activityService.deleteActivity(id);
      setActivities(prev => prev.filter(activity => activity.id !== id));
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete activity');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoad) {
      loadActivities();
      loadStats();
    }
  }, [autoLoad, loadActivities, loadStats]);

  return {
    activities,
    stats,
    loading,
    error,
    loadActivities,
    loadStats,
    createActivity,
    deleteActivity,
  };
} 