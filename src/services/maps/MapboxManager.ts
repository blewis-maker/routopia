import mapboxgl from 'mapbox-gl';
import { MapServiceInterface, Coordinates, MapBounds } from './MapServiceInterface';

export class MapboxManager implements MapServiceInterface {
  private map: mapboxgl.Map | null = null;
  private markers: Map<string, mapboxgl.Marker> = new Map();
  private routeLine: mapboxgl.Layer | null = null;

  async initialize(containerId: string): Promise<void> {
    if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
      throw new Error('Mapbox token not configured');
    }

    this.map = new mapboxgl.Map({
      container: containerId,
      style: 'mapbox://styles/mapbox/dark-v10',
      accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
    });

    await new Promise<void>((resolve) => {
      this.map?.on('load', () => resolve());
    });
  }

  // ... implement other interface methods while preserving
  // your existing Mapbox implementation
} 