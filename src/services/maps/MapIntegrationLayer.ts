import { MapServiceInterface, Coordinates, MapBounds } from './MapServiceInterface';
import { MapboxManager } from './MapboxManager';
import { GoogleMapsManager } from './GoogleMapsManager';
import { RouteProcessor, ProcessedRoute, Location } from '../routing/RouteProcessor';
import { MAP_FEATURE_FLAGS } from '@/lib/config';

export type MapProvider = 'mapbox' | 'google';

interface MapState {
  center?: Coordinates;
  zoom?: number;
  markers: Array<{
    id: string;
    coordinates: Coordinates;
    type?: 'start' | 'end' | 'waypoint';
  }>;
  route?: {
    start: Coordinates;
    end: Coordinates;
    waypoints: Coordinates[];
  };
}

export class MapIntegrationLayer {
  private activeProvider: MapServiceInterface;
  private providers: Map<MapProvider, MapServiceInterface>;
  private state: MapState;
  private containerId: string;
  private routeProcessor: RouteProcessor;
  private currentRoute: ProcessedRoute | null = null;

  constructor(containerId: string) {
    if (!containerId) {
      throw new Error('Container ID is required');
    }
    this.containerId = containerId;
    this.providers = new Map();
    this.state = { markers: [] };

    // Initialize providers
    this.providers.set('mapbox', new MapboxManager());
    this.providers.set('google', new GoogleMapsManager());
    
    // Default to Mapbox
    this.activeProvider = this.providers.get('mapbox')!;
    
    // Initialize RouteProcessor with same provider
    this.routeProcessor = new RouteProcessor(
      this.getActiveProviderName(),
      process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    );
  }

  async initialize(): Promise<void> {
    const container = document.getElementById(this.containerId);
    if (!container) {
      throw new Error(`Container '${this.containerId}' not found`);
    }

    await this.activeProvider.initialize(this.containerId);
    
    // Restore state if exists
    if (this.state.center) {
      this.setCenter(this.state.center);
    }
    if (this.state.zoom) {
      this.setZoom(this.state.zoom);
    }
    // Restore markers and routes
    this.restoreState();
  }

  async switchProvider(provider: MapProvider): Promise<void> {
    if (!this.providers.has(provider)) {
      throw new Error(`Map provider ${provider} not configured`);
    }

    // Save current state
    this.saveState();

    // Switch map provider
    const newProvider = this.providers.get(provider)!;
    await newProvider.initialize(this.containerId);
    this.activeProvider = newProvider;

    // Switch route processor provider
    this.routeProcessor = new RouteProcessor(
      provider,
      process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    );

    // Restore state on new provider
    await this.restoreState();

    // Recalculate current route if exists
    if (this.currentRoute && this.state.route) {
      await this.calculateRoute(
        this.state.route.start,
        this.state.route.end,
        this.state.route.waypoints
      );
    }
  }

  private saveState(): void {
    // Save current view state
    const bounds = this.activeProvider.getBounds();
    this.state = {
      ...this.state,
      center: this.activeProvider.getCenter(),
      zoom: this.activeProvider.getZoom(),
    };
  }

  private async restoreState(): Promise<void> {
    const { markers, route } = this.state;

    // Restore markers
    markers.forEach(marker => {
      this.activeProvider.addMarker(marker.coordinates, { type: marker.type });
    });

    // Restore route if exists
    if (route) {
      await this.activeProvider.drawRoute(route.start, route.end, route.waypoints);
    }
  }

  // Public API methods that match your existing Map component
  async addMarker(coordinates: Coordinates, options?: { type?: 'start' | 'end' | 'waypoint' }): Promise<string> {
    const markerId = await this.activeProvider.addMarker(coordinates, options);
    this.state.markers.push({
      id: markerId,
      coordinates,
      type: options?.type
    });
    return markerId;
  }

  removeMarker(markerId: string): void {
    this.activeProvider.removeMarker(markerId);
    this.state.markers = this.state.markers.filter(m => m.id !== markerId);
  }

  async drawRoute(start: Coordinates, end: Coordinates, waypoints: Coordinates[] = []): Promise<void> {
    await this.activeProvider.drawRoute(start, end, waypoints);
    this.state.route = { start, end, waypoints };
  }

  clearRoute(): void {
    this.activeProvider.clearRoute();
    delete this.state.route;
  }

  // Traffic layer methods
  setTrafficLayer(visible: boolean): void {
    if (this.activeProvider.setTrafficLayer) {
      this.activeProvider.setTrafficLayer(visible);
    }
  }

  // Geolocation methods
  setGeolocateControl(enabled: boolean): void {
    if (this.activeProvider.setGeolocateControl) {
      this.activeProvider.setGeolocateControl(enabled);
    }
  }

  // Utility methods
  getActiveProviderName(): MapProvider {
    return this.providers.get('google') === this.activeProvider ? 'google' : 'mapbox';
  }

  getState(): MapState {
    return { ...this.state };
  }

  async calculateRoute(
    start: Location,
    end: Location,
    waypoints: Location[] = []
  ): Promise<ProcessedRoute> {
    try {
      // Process the route
      const processedRoute = await this.routeProcessor.processRoute(
        start,
        end,
        waypoints,
        {
          optimizeWaypoints: true,
          trafficModel: 'best_guess',
          avoidHighways: false,
          avoidTolls: false
        }
      );

      // Store current route
      this.currentRoute = processedRoute;

      // Visualize the route
      await this.visualizeRoute(processedRoute);

      return processedRoute;
    } catch (error) {
      console.error('Route calculation error:', error);
      throw error;
    }
  }

  private async visualizeRoute(route: ProcessedRoute): Promise<void> {
    // Clear existing route
    this.clearRoute();

    // Draw main route
    await this.activeProvider.drawRoute(route.coordinates);

    // Show alternative routes if enabled
    if (MAP_FEATURE_FLAGS.useAlternativeRoutes && route.alternatives) {
      route.alternatives.forEach(async (alt) => {
        await this.activeProvider.showAlternativeRoutes?.(alt.coordinates);
      });
    }

    // Show traffic data if enabled
    if (MAP_FEATURE_FLAGS.useTrafficData) {
      this.setTrafficLayer(true);
    }

    // Fit bounds to show entire route
    const allCoords = [
      route.coordinates,
      ...(route.alternatives?.map(alt => alt.coordinates) || [])
    ].flat();

    if (allCoords.length > 0) {
      this.fitBounds(allCoords);
    }
  }

  private fitBounds(coordinates: [number, number][]): void {
    const bounds = coordinates.reduce(
      (bounds, coord) => bounds.extend(coord),
      new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
    );

    this.activeProvider.fitBounds(bounds);
  }
} 