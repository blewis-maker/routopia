import { config } from './config';
import type { SearchResult, Route } from '../types';

export const mapboxAPI = {
  async geocode(query: string): Promise<SearchResult[]> {
    const url = `${config.api.mapbox.geocodingEndpoint}/${encodeURIComponent(query)}.json`;
    const params = new URLSearchParams({
      access_token: process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '',
      limit: '5'
    });

    const response = await fetch(`${url}?${params}`);
    const data = await response.json();
    return data.features.map((feature: any) => ({
      id: feature.id,
      place_name: feature.place_name,
      coordinates: feature.center,
      type: feature.place_type[0]
    }));
  },

  async getDirections(
    start: [number, number],
    end: [number, number],
    waypoints?: [number, number][]
  ): Promise<Route> {
    // Implementation here
    throw new Error('Not implemented');
  }
}; 