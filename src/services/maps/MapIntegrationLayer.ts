import { MapServiceInterface, Coordinates, MapBounds } from './MapServiceInterface';
import { MapboxManager } from './MapboxManager';
import { GoogleMapsManager } from './GoogleMapsManager';
import { RouteProcessor, ProcessedRoute, Location } from '../routing/RouteProcessor';
import { MAP_FEATURE_FLAGS } from '@/lib/config';
import { ElevationLayer, ElevationData } from './ElevationLayer';
import { WeatherLayer, WeatherData } from './WeatherLayer';
import { AIRouteEnhancer } from '../ai/AIRouteEnhancer';
import { ActivityType } from '@/types/activities';
import { RouteVisualizationOptions } from '@/types/maps';

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

interface EnhancedRouteOptions {
  activityType: ActivityType;
  showTraffic?: boolean;
  showAlternatives?: boolean;
  isInteractive?: boolean;
}

export class MapIntegrationLayer {
  private activeProvider: MapServiceInterface;
  private providers: Map<MapProvider, MapServiceInterface>;
  private state: MapState;
  private containerId: string;
  private routeProcessor: RouteProcessor;
  private currentRoute: ProcessedRoute | null = null;
  private chatContext: {
    currentIntent?: 'ROUTE_PLANNING' | 'LOCATION_SEARCH' | 'PLACE_INFO';
    suggestedLocations?: Location[];
    activeRoute?: ProcessedRoute;
    routeEnhancement?: AIResponseEnhancement;
  } = {};
  private elevationLayer: ElevationLayer;
  private weatherLayer: WeatherLayer;
  private aiEnhancer: AIRouteEnhancer;
  private routeLayer: typeof RouteLayer | null = null;
  private activeRoute: ProcessedRoute | null = null;
  private routeOptions: EnhancedRouteOptions = {
    activityType: 'car',
    showTraffic: true,
    showAlternatives: true,
    isInteractive: true
  };

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
    this.elevationLayer = new ElevationLayer();
    this.weatherLayer = new WeatherLayer();
    this.aiEnhancer = new AIRouteEnhancer();
  }

  async initialize(): Promise<void> {
    const container = document.getElementById(this.containerId);
    if (!container) {
      throw new Error(`Container '${this.containerId}' not found`);
    }

    // Initialize with dark style
    await this.activeProvider.initialize(this.containerId, {
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-74.5, 40], // Default center
      zoom: 9,
      attributionControl: false,
      preserveDrawingBuffer: true
    });

    // Add controls after initialization
    this.activeProvider.addControls({
      navigation: true,
      geolocate: true,
      scale: true
    });

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

  async drawRoute(
    start: Coordinates,
    end: Coordinates,
    waypoints: Coordinates[] = [],
    options?: Partial<EnhancedRouteOptions>
  ): Promise<void> {
    // Merge options with defaults
    this.routeOptions = {
      ...this.routeOptions,
      ...options
    };

    // Calculate route with traffic data
    const route = await this.calculateRoute(start, end, waypoints);
    this.activeRoute = route;

    // Get alternative routes if enabled
    let alternatives: ProcessedRoute[] = [];
    if (this.routeOptions.showAlternatives) {
      alternatives = await this.routeProcessor.getAlternativeRoutes(
        start,
        end,
        waypoints
      );
    }

    // Get traffic data if enabled
    const trafficData = this.routeOptions.showTraffic
      ? await this.routeProcessor.getTrafficData(route)
      : undefined;

    // Create or update route layer
    if (!this.routeLayer) {
      this.routeLayer = new RouteLayer({
        route,
        alternatives,
        activityType: this.routeOptions.activityType,
        trafficData,
        isInteractive: this.routeOptions.isInteractive,
        onWaypointDrag: this.handleWaypointDrag.bind(this)
      });
    } else {
      // Update existing route layer
      this.routeLayer.updateRoute(route, {
        alternatives,
        trafficData,
        activityType: this.routeOptions.activityType
      });
    }

    // Store route in state
    this.state.route = { start, end, waypoints };
  }

  private async handleWaypointDrag(index: number, newCoords: [number, number]) {
    if (!this.state.route || !this.activeRoute) return;

    const { start, end, waypoints } = this.state.route;
    let newWaypoints = [...waypoints];

    // Update appropriate coordinate based on index
    if (index === 0) {
      await this.drawRoute(
        { lat: newCoords[1], lng: newCoords[0] },
        end,
        newWaypoints
      );
    } else if (index === waypoints.length + 1) {
      await this.drawRoute(
        start,
        { lat: newCoords[1], lng: newCoords[0] },
        newWaypoints
      );
    } else {
      newWaypoints[index - 1] = { lat: newCoords[1], lng: newCoords[0] };
      await this.drawRoute(start, end, newWaypoints);
    }
  }

  clearRoute(): void {
    if (this.routeLayer) {
      this.routeLayer.remove();
      this.routeLayer = null;
    }
    this.activeRoute = null;
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

      // Gather context for AI enhancement
      const context = await this.gatherRouteContext(processedRoute);
      
      // Enhance route with AI suggestions
      const enhancement = await this.aiEnhancer.enhanceRoute(processedRoute, context);
      
      // Store current route and enhancement
      this.currentRoute = processedRoute;
      this.chatContext.activeRoute = processedRoute;
      this.chatContext.routeEnhancement = enhancement;

      // Visualize the route with enhancements
      await this.visualizeEnhancedRoute(processedRoute, enhancement);

      return processedRoute;
    } catch (error) {
      console.error('Route calculation error:', error);
      throw error;
    }
  }

  private async gatherRouteContext(route: ProcessedRoute) {
    const [trafficData, weatherData, elevationData] = await Promise.all([
      this.routeProcessor.getTrafficData(route),
      this.showRouteWeather(route),
      this.getElevationProfile(route.coordinates)
    ]);

    const placeDetails = await this.searchNearbyPlaces(route);

    return {
      trafficData,
      weatherConditions: weatherData[0], // Use weather from route start
      elevationProfile: elevationData,
      placeDetails,
      businessHours: placeDetails.map(place => ({
        isOpen: place.businessHours?.[0]?.isOpen || false,
        nextOpen: place.businessHours?.[0]?.nextOpen,
        nextClose: place.businessHours?.[0]?.nextClose
      }))
    };
  }

  private async visualizeEnhancedRoute(
    route: ProcessedRoute,
    enhancement: AIResponseEnhancement
  ): Promise<void> {
    // Clear existing route
    this.clearRoute();

    // Draw enhanced route with all features
    await this.drawRoute(
      route.coordinates[0],
      route.coordinates[route.coordinates.length - 1],
      route.coordinates.slice(1, -1),
      {
        activityType: enhancement.recommendedActivity || 'car',
        showTraffic: true,
        showAlternatives: true,
        isInteractive: true
      }
    );

    // Show recommended places
    await this.showRecommendedPlaces(enhancement.placeRecommendations);

    // Show weather overlays
    await this.showRouteWeather(route);

    // Fit bounds to show entire route with context
    this.fitBoundsToEnhancedRoute(route, enhancement);
  }

  private async showRecommendedPlaces(recommendations: AIResponseEnhancement['placeRecommendations']): Promise<void> {
    const places = [
      ...recommendations.openNow,
      ...recommendations.highlyRated,
      ...recommendations.weatherAppropriate
    ];

    // Deduplicate places
    const uniquePlaces = Array.from(new Set(places.map(p => p.placeId)))
      .map(id => places.find(p => p.placeId === id)!);

    // Show markers for recommended places
    for (const place of uniquePlaces) {
      await this.addMarker(place.coordinates, {
        type: 'poi',
        icon: 'recommendation'
      });
    }
  }

  private fitBoundsToEnhancedRoute(
    route: ProcessedRoute,
    enhancement: AIResponseEnhancement
  ): void {
    const allCoordinates = [
      route.coordinates,
      ...enhancement.routeSuggestions.trafficBasedAlternatives.map(r => r.coordinates),
      ...enhancement.routeSuggestions.weatherAwareOptions.map(r => r.coordinates),
      ...enhancement.routeSuggestions.activityOptimizedPaths.map(r => r.coordinates)
    ].flat();

    if (allCoordinates.length > 0) {
      this.fitBounds(allCoordinates);
    }
  }

  // Add new methods for chat integration
  async handleChatAction(action: {
    type: 'SEARCH_LOCATION' | 'PLAN_ROUTE' | 'SHOW_PLACE_INFO';
    payload: any;
  }) {
    switch (action.type) {
      case 'SEARCH_LOCATION':
        const locations = await this.searchLocations(action.payload.query);
        this.chatContext.suggestedLocations = locations;
        return locations;
        
      case 'PLAN_ROUTE':
        const route = await this.calculateRoute(
          action.payload.start,
          action.payload.end,
          action.payload.waypoints
        );
        this.chatContext.activeRoute = route;
        return route;

      case 'SHOW_PLACE_INFO':
        return this.showPlaceDetails(action.payload.placeId);
    }
  }

  private async searchLocations(query: string): Promise<Location[]> {
    // Implement geocoding search
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
      `access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&` +
      'types=place,address,poi&limit=5'
    );
    
    const data = await response.json();
    return data.features.map((f: any) => ({
      coordinates: f.center,
      address: f.place_name
    }));
  }

  async getElevationProfile(path: Coordinates[]): Promise<ElevationData> {
    return this.elevationLayer.getElevationProfile(path);
  }

  async showElevationProfile(path: Coordinates[]): Promise<void> {
    if (!this.map) return;

    const elevationData = await this.getElevationProfile(path);
    await this.elevationLayer.visualizeElevation(this.map, elevationData);
  }

  async showWeather(location: Coordinates): Promise<WeatherData> {
    const weatherData = await this.weatherLayer.getWeatherData(location);
    await this.weatherLayer.showWeatherOverlay(this.activeProvider.getMap(), location);
    return weatherData;
  }

  async showRouteWeather(route: ProcessedRoute): Promise<WeatherData[]> {
    // Get weather for start, end, and key waypoints
    const points = [
      route.coordinates[0],
      ...route.coordinates.filter((_, i) => 
        i % Math.floor(route.coordinates.length / 3) === 0
      ),
      route.coordinates[route.coordinates.length - 1]
    ];

    return Promise.all(
      points.map(coord => this.showWeather(coord))
    );
  }

  private fitBounds(coordinates: [number, number][]): void {
    const bounds = coordinates.reduce(
      (bounds, coord) => bounds.extend(coord),
      new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
    );

    this.activeProvider.fitBounds(bounds);
  }
} 