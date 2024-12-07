import { useState, useCallback } from 'react';
import { 
  routeService, 
  Route, 
  RoutePoint, 
  RoutePreferences,
  CreateRouteParams 
} from '@/services/api/routes';

interface UseRoutePlannerOptions {
  initialRoute?: Route;
}

export function useRoutePlanner({ initialRoute }: UseRoutePlannerOptions = {}) {
  const [route, setRoute] = useState<Route | null>(initialRoute || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createRoute = useCallback(async (params: CreateRouteParams) => {
    setLoading(true);
    setError(null);
    try {
      const newRoute = await routeService.createRoute(params);
      setRoute(newRoute);
      return newRoute;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create route');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePoints = useCallback(async (points: RoutePoint[]) => {
    if (!route) return;
    setLoading(true);
    setError(null);
    try {
      const updatedRoute = await routeService.updateRoute({
        id: route.id,
        points,
      });
      setRoute(updatedRoute);
      return updatedRoute;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update route');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [route]);

  const optimizeRoute = useCallback(async (preferences: RoutePreferences) => {
    if (!route) return;
    setLoading(true);
    setError(null);
    try {
      const optimizedRoute = await routeService.optimizeRoute(route.id, preferences);
      setRoute(optimizedRoute);
      return optimizedRoute;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to optimize route');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [route]);

  const deleteRoute = useCallback(async () => {
    if (!route) return;
    setLoading(true);
    setError(null);
    try {
      await routeService.deleteRoute(route.id);
      setRoute(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete route');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [route]);

  return {
    route,
    loading,
    error,
    createRoute,
    updatePoints,
    optimizeRoute,
    deleteRoute,
  };
} 