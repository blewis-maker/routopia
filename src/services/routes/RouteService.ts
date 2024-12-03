import type { RouteData } from '@/types/routes';

export class RouteService {
  async saveRoute(route: RouteData): Promise<{ success: boolean }> {
    if (!route.id) {
      throw new Error('Route ID is required');
    }
    
    localStorage.setItem(`route_${route.id}`, JSON.stringify(route));
    return { success: true };
  }

  async getRoute(id: string): Promise<RouteData | null> {
    const route = localStorage.getItem(`route_${id}`);
    return route ? JSON.parse(route) : null;
  }

  async getAllRoutes(): Promise<RouteData[]> {
    const routes: RouteData[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('route_')) {
        const route = localStorage.getItem(key);
        if (route) {
          routes.push(JSON.parse(route));
        }
      }
    }
    return routes;
  }

  async deleteRoute(id: string): Promise<{ success: boolean }> {
    localStorage.removeItem(`route_${id}`);
    return { success: true };
  }
} 