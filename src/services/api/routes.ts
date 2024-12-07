import axios from 'axios';

export interface RoutePoint {
  lat: number;
  lon: number;
  name?: string;
}

export interface Route {
  id: string;
  name: string;
  points: RoutePoint[];
  distance: number;
  duration: number;
  elevation: {
    gain: number;
    loss: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateRouteParams {
  name: string;
  points: RoutePoint[];
}

export interface UpdateRouteParams {
  id: string;
  name?: string;
  points?: RoutePoint[];
}

class RouteService {
  private api;

  constructor() {
    this.api = axios.create({
      baseURL: '/api/routes',
    });
  }

  async getRoutes(): Promise<Route[]> {
    try {
      const { data } = await this.api.get<Route[]>('/');
      return data;
    } catch (error) {
      console.error('Error fetching routes:', error);
      throw new Error('Failed to fetch routes');
    }
  }

  async getRoute(id: string): Promise<Route> {
    try {
      const { data } = await this.api.get<Route>(`/${id}`);
      return data;
    } catch (error) {
      console.error('Error fetching route:', error);
      throw new Error('Failed to fetch route');
    }
  }

  async createRoute(params: CreateRouteParams): Promise<Route> {
    try {
      const { data } = await this.api.post<Route>('/', params);
      return data;
    } catch (error) {
      console.error('Error creating route:', error);
      throw new Error('Failed to create route');
    }
  }

  async updateRoute(params: UpdateRouteParams): Promise<Route> {
    try {
      const { data } = await this.api.put<Route>(`/${params.id}`, params);
      return data;
    } catch (error) {
      console.error('Error updating route:', error);
      throw new Error('Failed to update route');
    }
  }

  async deleteRoute(id: string): Promise<void> {
    try {
      await this.api.delete(`/${id}`);
    } catch (error) {
      console.error('Error deleting route:', error);
      throw new Error('Failed to delete route');
    }
  }

  async optimizeRoute(id: string, preferences: RoutePreferences): Promise<Route> {
    try {
      const { data } = await this.api.post<Route>(`/${id}/optimize`, preferences);
      return data;
    } catch (error) {
      console.error('Error optimizing route:', error);
      throw new Error('Failed to optimize route');
    }
  }
}

export interface RoutePreferences {
  avoidHighways?: boolean;
  avoidTolls?: boolean;
  preferScenic?: boolean;
  maxElevationGain?: number;
  transportMode?: 'driving' | 'walking' | 'cycling';
}

export const routeService = new RouteService(); 