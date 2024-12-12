import { Route } from '@/types/route/types';

export class RouteCache {
  private cache: Map<string, Route[]>;

  constructor() {
    this.cache = new Map();
  }

  async getSavedRoutes(userId: string): Promise<Route[]> {
    if (this.cache.has(userId)) {
      return this.cache.get(userId) || [];
    }

    try {
      const response = await fetch('/api/routes/saved');
      if (!response.ok) {
        throw new Error('Failed to fetch routes');
      }
      const routes = await response.json();
      this.cache.set(userId, routes);
      return routes;
    } catch (error) {
      console.error('Error fetching saved routes:', error);
      return [];
    }
  }

  clearCache(userId: string) {
    this.cache.delete(userId);
  }
} 