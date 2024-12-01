import { Coordinates } from '../maps/MapServiceInterface';
import { mapUtils } from '@/lib/utils';

export interface RouteOptions {
  avoidTolls?: boolean;
  avoidHighways?: boolean;
  optimizeWaypoints?: boolean;
  routeType?: 'fastest' | 'shortest' | 'scenic';
  trafficModel?: 'best_guess' | 'pessimistic' | 'optimistic';
}

// Match your existing Map component's location structure
export interface Location {
  coordinates: [number, number];
  address: string;
}

export interface RouteSegment {
  startLocation: Location;
  endLocation: Location;
  distance: number;
  duration: number;
  trafficDuration?: number;
  instructions: string;
}

export interface ProcessedRoute {
  coordinates: [number, number][]; // For map visualization
  segments: RouteSegment[];
  totalDistance: number;
  totalDuration: number;
  trafficDuration?: number;
  alternatives?: {
    coordinates: [number, number][];
    probability: number;
  }[];
  lastUpdated: Date;
}

export class RouteProcessor {
  private googleDirectionsService: google.maps.DirectionsService | null = null;
  private mapboxToken: string;

  constructor(
    private activeProvider: 'google' | 'mapbox' = 'mapbox',
    mapboxToken?: string
  ) {
    this.mapboxToken = mapboxToken || process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
    if (!this.mapboxToken) {
      throw new Error('Mapbox token not configured');
    }
  }

  async processRoute(
    start: Location,
    end: Location,
    waypoints: Location[] = [],
    options: RouteOptions = {}
  ): Promise<ProcessedRoute> {
    try {
      return this.activeProvider === 'google'
        ? await this.processGoogleRoute(start, end, waypoints, options)
        : await this.processMapboxRoute(start, end, waypoints, options);
    } catch (error) {
      console.error(`${this.activeProvider} route processing error:`, error);
      // Fallback to other provider
      this.activeProvider = this.activeProvider === 'google' ? 'mapbox' : 'google';
      return this.processRoute(start, end, waypoints, options);
    }
  }

  private async processMapboxRoute(
    start: Location,
    end: Location,
    waypoints: Location[],
    options: RouteOptions
  ): Promise<ProcessedRoute> {
    const coordinates = [
      start.coordinates,
      ...waypoints.map(wp => wp.coordinates),
      end.coordinates
    ].map(coord => coord.join(',')).join(';');

    const params = new URLSearchParams({
      access_token: this.mapboxToken,
      geometries: 'geojson',
      overview: 'full',
      alternatives: 'true',
      annotations: 'duration,distance,speed',
      steps: 'true'
    });

    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?${params}`
    );

    if (!response.ok) {
      throw new Error('Mapbox directions request failed');
    }

    const data = await response.json();
    const mainRoute = data.routes[0];

    return {
      coordinates: mainRoute.geometry.coordinates,
      segments: this.convertMapboxLegs(mainRoute.legs, [start, ...waypoints, end]),
      totalDistance: mainRoute.distance,
      totalDuration: mainRoute.duration,
      alternatives: data.routes.slice(1).map((route: any) => ({
        coordinates: route.geometry.coordinates,
        probability: route.weight / mainRoute.weight
      })),
      lastUpdated: new Date()
    };
  }

  private async processGoogleRoute(
    start: Location,
    end: Location,
    waypoints: Location[],
    options: RouteOptions
  ): Promise<ProcessedRoute> {
    if (!this.googleDirectionsService) {
      this.googleDirectionsService = new google.maps.DirectionsService();
    }

    const result = await this.googleDirectionsService.route({
      origin: { lat: start.coordinates[1], lng: start.coordinates[0] },
      destination: { lat: end.coordinates[1], lng: end.coordinates[0] },
      waypoints: waypoints.map(wp => ({
        location: { lat: wp.coordinates[1], lng: wp.coordinates[0] },
        stopover: true
      })),
      optimizeWaypoints: options.optimizeWaypoints,
      provideRouteAlternatives: true,
      travelMode: google.maps.TravelMode.DRIVING,
      drivingOptions: {
        departureTime: new Date(),
        trafficModel: google.maps.TrafficModel[options.trafficModel || 'BEST_GUESS']
      }
    });

    const mainRoute = result.routes[0];
    const path = mainRoute.overview_path.map(point => 
      [point.lng(), point.lat()] as [number, number]
    );

    return {
      coordinates: path,
      segments: this.convertGoogleLegs(mainRoute.legs, [start, ...waypoints, end]),
      totalDistance: mainRoute.legs.reduce((sum, leg) => sum + (leg.distance?.value || 0), 0),
      totalDuration: mainRoute.legs.reduce((sum, leg) => sum + (leg.duration?.value || 0), 0),
      trafficDuration: mainRoute.legs.reduce((sum, leg) => sum + (leg.duration_in_traffic?.value || leg.duration.value), 0),
      alternatives: result.routes.slice(1).map(route => ({
        coordinates: route.overview_path.map(point => [point.lng(), point.lat()] as [number, number]),
        probability: 1 / result.routes.length
      })),
      lastUpdated: new Date()
    };
  }

  private convertMapboxLegs(legs: any[], locations: Location[]): RouteSegment[] {
    return legs.map((leg, i) => ({
      startLocation: locations[i],
      endLocation: locations[i + 1],
      distance: leg.distance,
      duration: leg.duration,
      instructions: leg.steps.map((step: any) => step.maneuver.instruction).join(' ')
    }));
  }

  private convertGoogleLegs(
    legs: google.maps.DirectionsLeg[],
    locations: Location[]
  ): RouteSegment[] {
    return legs.map((leg, i) => ({
      startLocation: locations[i],
      endLocation: locations[i + 1],
      distance: leg.distance?.value || 0,
      duration: leg.duration?.value || 0,
      trafficDuration: leg.duration_in_traffic?.value,
      instructions: leg.steps.map(step => step.instructions).join(' ')
    }));
  }
} 