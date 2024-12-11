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
    if (!this.map) {
      throw new Error('Map not initialized');
    }

    try {
      const markerId = `marker-${Date.now()}`;
      const marker = new mapboxgl.Marker({
        color: options?.type === 'start' ? '#00B2B2' : '#FF0000',
        draggable: options?.draggable
      })
        .setLngLat([coordinates.lng, coordinates.lat]);

      // Wait for map to be ready before adding marker
      if (this.map.loaded()) {
        marker.addTo(this.map);
      } else {
        this.map.once('load', () => marker.addTo(this.map!));
      }

      this.markers.set(markerId, marker);
      return markerId;
    } catch (error) {
      console.error('Error adding marker:', error);
      throw error;
    }
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

  async generateRoute(start: Coordinates, end: Coordinates, waypoints?: Coordinates[]): Promise<RouteVisualization> {
    const request: google.maps.DirectionsRequest = {
      origin: { lat: start.lat, lng: start.lng },
      destination: { lat: end.lat, lng: end.lng },
      travelMode: google.maps.TravelMode.DRIVING,
      waypoints: waypoints?.map(wp => ({
        location: { lat: wp.lat, lng: wp.lng },
        stopover: true
      }))
    };

    try {
      const result = await this.directionsService.route(request);
      return this.convertToRouteVisualization(result);
    } catch (error) {
      console.error('Failed to generate route:', error);
      throw error;
    }
  }

  async addUserLocationMarker(coordinates: Coordinates): Promise<void> {
    if (!this.map) return;

    try {
      await this.addMarker(coordinates, {
        type: 'start',
        title: 'Your Location',
        draggable: false
      });
    } catch (error) {
      console.error('Error adding user location marker:', error);
    }
  }

  private convertToRouteVisualization(result: google.maps.DirectionsResult): RouteVisualization {
    const route = result.routes[0];
    const path = route.overview_path;

    return {
      coordinates: path.map(point => ({
        lat: point.lat(),
        lng: point.lng()
      })),
      distance: route.legs.reduce((total, leg) => total + (leg.distance?.value || 0), 0),
      duration: route.legs.reduce((total, leg) => total + (leg.duration?.value || 0), 0),
      bounds: {
        north: route.bounds.getNorthEast().lat(),
        south: route.bounds.getSouthWest().lat(),
        east: route.bounds.getNorthEast().lng(),
        west: route.bounds.getSouthWest().lng()
      }
    };
  }

  redrawOverlays() {
    if (!this.map) return;

    // Redraw route if exists
    const routeSource = this.map.getSource('route');
    if (routeSource) {
      const routeData = (routeSource as mapboxgl.GeoJSONSource).serialize();
      this.map.addSource('route', routeData);
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
    }

    // Redraw markers
    this.markers.forEach(marker => {
      marker.addTo(this.map!);
    });
  }
} 