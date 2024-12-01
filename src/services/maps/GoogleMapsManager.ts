import { Loader } from '@googlemaps/js-api-loader';
import { MapServiceInterface, Coordinates, MapBounds } from './MapServiceInterface';
import { mapUtils } from '@/lib/utils';

export class GoogleMapsManager implements MapServiceInterface {
  private map: google.maps.Map | null = null;
  private markers: Map<string, google.maps.Marker> = new Map();
  private currentRoute: google.maps.Polyline | null = null;
  private loader: Loader;

  constructor() {
    const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
    if (!googleMapsKey) {
      throw new Error('Google Maps API key not configured');
    }

    this.loader = new Loader({
      apiKey: googleMapsKey,
      version: 'weekly',
      libraries: ['places']
    });
  }

  async initialize(containerId: string): Promise<void> {
    try {
      await this.loader.load();
      const container = document.getElementById(containerId);
      if (!container) throw new Error('Map container not found');

      this.map = new google.maps.Map(container, {
        center: { lat: 40.5852602, lng: -105.0749801 }, // Berthoud, CO
        zoom: 12,
        styles: [
          // Add your dark theme styles here
          { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
          // ... add more styles as needed
        ]
      });
    } catch (error) {
      console.error('Failed to initialize Google Maps:', error);
      throw error;
    }
  }

  setCenter(coordinates: Coordinates): void {
    if (!this.map) return;
    this.map.setCenter(coordinates);
  }

  setZoom(level: number): void {
    if (!this.map) return;
    this.map.setZoom(level);
  }

  async addMarker(coordinates: Coordinates, options?: { type?: 'start' | 'end' | 'waypoint' }): Promise<string> {
    if (!this.map) throw new Error('Map not initialized');

    const markerId = `marker-${Date.now()}`;
    const marker = new google.maps.Marker({
      position: coordinates,
      map: this.map,
      icon: this.getMarkerIcon(options?.type)
    });

    this.markers.set(markerId, marker);
    return markerId;
  }

  removeMarker(markerId: string): void {
    const marker = this.markers.get(markerId);
    if (marker) {
      marker.setMap(null);
      this.markers.delete(markerId);
    }
  }

  async drawRoute(start: Coordinates, end: Coordinates, waypoints: Coordinates[] = []): Promise<void> {
    if (!this.map) return;

    // Clear existing route
    if (this.currentRoute) {
      this.currentRoute.setMap(null);
    }

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
      map: this.map,
      suppressMarkers: true // We'll handle markers separately
    });

    try {
      const result = await directionsService.route({
        origin: start,
        destination: end,
        waypoints: waypoints.map(wp => ({ location: wp, stopover: true })),
        travelMode: google.maps.TravelMode.DRIVING
      });

      directionsRenderer.setDirections(result);
    } catch (error) {
      console.error('Failed to draw route:', error);
      throw error;
    }
  }

  clearRoute(): void {
    if (this.currentRoute) {
      this.currentRoute.setMap(null);
      this.currentRoute = null;
    }
  }

  setTrafficLayer(visible: boolean): void {
    if (!this.map) return;
    
    if (visible) {
      new google.maps.TrafficLayer().setMap(this.map);
    } else {
      new google.maps.TrafficLayer().setMap(null);
    }
  }

  private getMarkerIcon(type?: 'start' | 'end' | 'waypoint'): google.maps.Symbol | undefined {
    if (!type) return undefined;

    switch (type) {
      case 'start':
        return {
          url: '/location-marker.png',
          scaledSize: new google.maps.Size(24, 24)
        };
      case 'end':
        return {
          url: '/destination-marker.png',
          scaledSize: new google.maps.Size(24, 24)
        };
      case 'waypoint':
        return {
          url: '/waypoint-marker.png',
          scaledSize: new google.maps.Size(24, 24)
        };
      default:
        return undefined;
    }
  }
} 