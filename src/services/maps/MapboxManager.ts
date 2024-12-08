import mapboxgl from 'mapbox-gl';
import { 
  Coordinates, 
  MapBounds, 
  MapServiceInterface, 
  RouteOptions, 
  RouteVisualization,
  TrafficData,
  TrafficOptions 
} from './MapServiceInterface';
import { GoogleMapsManager } from './GoogleMapsManager';
import { RouteCache } from '@/lib/cache/RouteCache';
import { PerformanceMetrics } from '@/services/monitoring/PerformanceMetrics';

export class MapboxManager implements MapServiceInterface {
  private map: mapboxgl.Map | null = null;
  private markers: Map<string, mapboxgl.Marker> = new Map();
  private routeCache: RouteCache;
  private performanceMetrics: PerformanceMetrics;

  constructor() {
    this.routeCache = new RouteCache();
    this.performanceMetrics = new PerformanceMetrics();
  }

  async initialize(containerId: string, options?: {
    style?: string;
    center?: Coordinates;
    zoom?: number;
    attributionControl?: boolean;
    preserveDrawingBuffer?: boolean;
  }): Promise<void> {
    const container = document.getElementById(containerId);
    if (!container) throw new Error('Map container not found');

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!mapboxToken) {
      throw new Error('Mapbox token not found');
    }

    mapboxgl.accessToken = mapboxToken;

    this.map = new mapboxgl.Map({
      container: containerId,
      style: options?.style || 'mapbox://styles/mapbox/dark-v11',
      center: options?.center ? [options.center.lng, options.center.lat] : [-105.0749801, 40.5852602],
      zoom: options?.zoom || 12,
      attributionControl: options?.attributionControl ?? true,
      preserveDrawingBuffer: options?.preserveDrawingBuffer
    });

    await new Promise<void>((resolve) => {
      this.map?.on('load', () => resolve());
    });
  }

  setCenter(coordinates: Coordinates): void {
    this.map?.setCenter([coordinates.lng, coordinates.lat]);
  }

  setZoom(level: number): void {
    this.map?.setZoom(level);
  }

  getBounds(): MapBounds {
    const bounds = this.map?.getBounds();
    if (!bounds) throw new Error('Map not initialized');
    
    return {
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest()
    };
  }

  getCenter(): Coordinates {
    const center = this.map?.getCenter();
    if (!center) throw new Error('Map not initialized');
    
    return {
      lat: center.lat,
      lng: center.lng
    };
  }

  getZoom(): number {
    if (!this.map) throw new Error('Map not initialized');
    return this.map.getZoom();
  }

  addMarker(coordinates: Coordinates, options?: {
    type?: 'start' | 'end' | 'waypoint';
    draggable?: boolean;
    icon?: string;
    onClick?: () => void;
    onDragEnd?: (coords: Coordinates) => void;
  }): string {
    if (!this.map) throw new Error('Map not initialized');

    const markerId = `marker-${Date.now()}`;
    const marker = new mapboxgl.Marker({
      draggable: options?.draggable,
      color: this.getMarkerColor(options?.type)
    })
      .setLngLat([coordinates.lng, coordinates.lat])
      .addTo(this.map);

    if (options?.onClick) {
      marker.getElement().addEventListener('click', options.onClick);
    }

    if (options?.onDragEnd) {
      marker.on('dragend', () => {
        const pos = marker.getLngLat();
        options.onDragEnd?.({ lat: pos.lat, lng: pos.lng });
      });
    }

    this.markers.set(markerId, marker);
    return markerId;
  }

  removeMarker(markerId: string): void {
    const marker = this.markers.get(markerId);
    if (marker) {
      marker.remove();
      this.markers.delete(markerId);
    }
  }

  updateMarker(markerId: string, coordinates: Coordinates): void {
    const marker = this.markers.get(markerId);
    if (marker) {
      marker.setLngLat([coordinates.lng, coordinates.lat]);
    }
  }

  private getMarkerColor(type?: 'start' | 'end' | 'waypoint'): string {
    switch (type) {
      case 'start': return '#00ff00';
      case 'end': return '#ff0000';
      case 'waypoint': return '#0000ff';
      default: return '#000000';
    }
  }
} 