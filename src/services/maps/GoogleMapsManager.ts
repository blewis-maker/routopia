import { Loader } from '@googlemaps/js-api-loader';
import { 
  Coordinates, 
  MapBounds, 
  TrafficOptions, 
  RouteOptions, 
  RouteVisualization, 
  TrafficData, 
  MapServiceInterface 
} from './MapServiceInterface';
import { mapUtils } from '@/lib/utils';
import { ACTIVITY_COLORS, getActivityStyle, getTrafficStyle, mapStyles } from '@/lib/utils/mapStyles';
import { RouteVisualizationData, ActivityType, TrafficSegment } from '@/types/maps';
import GoogleMapsLoader from './GoogleMapsLoader';
import { Route } from '@/types/route/types';
import { DirectionsResult } from '@/types/route/types';
import { 
  RouteVisualization, 
  RouteVisualizationSegment,
  isRouteVisualization 
} from '@/types/route/visualization';
import { isValidLatLng } from '@/lib/utils/typeValidation';
import { MapVisualization } from '@/types/maps/visualization';
import mapboxgl from 'mapbox-gl';

export class GoogleMapsManager implements MapServiceInterface {
  private map: mapboxgl.Map | null = null;
  private markers: Map<string, mapboxgl.Marker> = new Map();
  private directionsService: google.maps.DirectionsService;

  constructor() {
    this.directionsService = new google.maps.DirectionsService();
  }

  setMapInstance(map: mapboxgl.Map): void {
    this.map = map;
  }

  getMap(): mapboxgl.Map | null {
    return this.map;
  }

  async drawRoute(route: RouteVisualization): Promise<void> {
    if (!this.map) return;

    // Clear any existing routes first
    this.clearRoute();

    try {
      // Add the route source
      this.map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: route.coordinates.map(coord => [coord.lng, coord.lat])
          }
        }
      });

      // Add the route layer
      this.map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#00B2B2',
          'line-width': 4
        }
      });
    } catch (error) {
      console.error('Error drawing route:', error);
      throw error;
    }
  }

  async addMarker(coordinates: Coordinates, options?: MarkerOptions): Promise<string> {
    if (!this.map) throw new Error('Map not initialized');

    const markerId = `marker-${Date.now()}`;
    const marker = new mapboxgl.Marker({
      color: options?.type === 'start' ? '#00B2B2' : '#FF0000',
      draggable: options?.draggable
    })
      .setLngLat([coordinates.lng, coordinates.lat])
      .addTo(this.map);

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

  clearRoute(): void {
    if (!this.map) return;

    if (this.map.getLayer('route')) {
      this.map.removeLayer('route');
    }
    if (this.map.getSource('route')) {
      this.map.removeSource('route');
    }
  }
} 