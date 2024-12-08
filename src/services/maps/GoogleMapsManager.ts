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
import { ACTIVITY_COLORS, getActivityStyle, getTrafficStyle } from '@/lib/utils/mapStyles';
import { RouteVisualizationData, ActivityType, TrafficSegment } from '@/types/maps';

export class GoogleMapsManager implements MapServiceInterface {
  private map: google.maps.Map | null = null;
  private markers: Map<string, google.maps.Marker> = new Map();
  private currentRoute: google.maps.Polyline | null = null;
  private loader: Loader;
  private trafficLayer: google.maps.TrafficLayer | null = null;
  private trafficIncidentsLayer: google.maps.visualization.HeatmapLayer | null = null;
  private directionsService: google.maps.DirectionsService | null = null;
  private placesService: google.maps.places.PlacesService | null = null;

  constructor() {
    const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
    if (!googleMapsKey) {
      throw new Error('Google Maps API key not found');
    }

    this.loader = new Loader({
      apiKey: googleMapsKey,
      version: 'weekly',
      libraries: ['places', 'visualization', 'geometry']
    });
  }

  async initialize(containerId: string, options?: {
    style?: string;
    center?: Coordinates;
    zoom?: number;
    attributionControl?: boolean;
    preserveDrawingBuffer?: boolean;
  }): Promise<void> {
    await this.loader.load();
    const container = document.getElementById(containerId);
    if (!container) throw new Error('Map container not found');

    const defaultCenter = { lat: 40.5852602, lng: -105.0749801 }; // Default center
    
    this.map = new google.maps.Map(container, {
      center: options?.center || defaultCenter,
      zoom: options?.zoom || 12,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true
    });

    // Initialize services
    if (this.map) {
      this.directionsService = new google.maps.DirectionsService();
      this.placesService = new google.maps.places.PlacesService(this.map);
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

  async drawRoute(
    route: RouteVisualization,
    options: RouteOptions
  ): Promise<void> {
    if (!this.map || !this.directionsService) return;

    const { mainRoute, alternatives, waypoints } = route;

    // Configure route rendering based on activity type
    const travelMode = this.getTravelMode(options.activityType);
    
    try {
      // Draw main route with traffic data if enabled
      const result = await this.directionsService.route({
        origin: mainRoute.coordinates[0],
        destination: mainRoute.coordinates[mainRoute.coordinates.length - 1],
        waypoints: waypoints?.via.map(wp => ({
          location: wp,
          stopover: true
        })),
        travelMode,
        provideRouteAlternatives: options.showAlternatives
      });

      // Render main route with custom styling
      this.renderRoute(result.routes[0], {
        ...options.style,
        isMain: true
      });

      // Handle traffic visualization if enabled
      if (options.showTraffic && mainRoute.trafficData) {
        this.visualizeTraffic(mainRoute.trafficData);
      }

      // Render alternative routes if available and enabled
      if (options.showAlternatives && alternatives) {
        alternatives.forEach((alt, index) => {
          this.renderRoute(result.routes[index + 1], {
            ...options.style,
            isMain: false
          });
        });
      }

      // Add interactive waypoint markers if enabled
      if (options.isInteractive && waypoints) {
        this.addInteractiveWaypoints(waypoints);
      }
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

  async setTrafficLayer(visible: boolean, options?: TrafficOptions): Promise<void> {
    if (!this.map) return;

    // Handle real-time traffic layer
    if (visible && options?.showRealTime) {
      if (!this.trafficLayer) {
        this.trafficLayer = new google.maps.TrafficLayer();
      }
      this.trafficLayer.setMap(this.map);
    } else if (this.trafficLayer) {
      this.trafficLayer.setMap(null);
    }

    // Handle incidents if enabled
    if (visible && options?.showIncidents) {
      const incidents = await this.getTrafficData();
      this.visualizeIncidents(incidents);
    } else if (this.trafficIncidentsLayer) {
      this.trafficIncidentsLayer.setMap(null);
    }

    // Handle alternative routes if enabled
    if (visible && options?.showAlternatives && this.currentRoute) {
      await this.showAlternativeRoutes(this.currentRoute.coordinates);
    }
  }

  async getTrafficData(): Promise<{
    congestionLevel: 'low' | 'medium' | 'high';
    incidents: Array<{
      type: string;
      description: string;
      location: Coordinates;
    }>;
  }> {
    if (!this.map) throw new Error('Map not initialized');

    try {
      // Get traffic data from Google Maps Roads API
      const bounds = this.map.getBounds();
      if (!bounds) throw new Error('Map bounds not available');

      const response = await fetch(
        `https://roads.googleapis.com/v1/snapToRoads?path=${bounds.getNorthEast().lat()},${bounds.getNorthEast().lng()}|${bounds.getSouthWest().lat()},${bounds.getSouthWest().lng()}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}`
      );

      const data = await response.json();

      // Process and analyze traffic data
      const congestionLevel = this.analyzeCongestionLevel(data);
      const incidents = await this.fetchTrafficIncidents(bounds);

      return {
        congestionLevel,
        incidents
      };
    } catch (error) {
      console.error('Failed to fetch traffic data:', error);
      return {
        congestionLevel: 'low',
        incidents: []
      };
    }
  }

  private async fetchTrafficIncidents(bounds: google.maps.LatLngBounds): Promise<Array<{
    type: string;
    description: string;
    location: Coordinates;
  }>> {
    // Use Google Maps JavaScript API to get traffic incidents
    const service = new google.maps.TrafficService();
    
    return new Promise((resolve) => {
      service.getTravelTimes({
        origin: bounds.getNorthEast(),
        destination: bounds.getSouthWest(),
        drivingOptions: {
          departureTime: new Date(),
          trafficModel: google.maps.TrafficModel.BEST_GUESS
        }
      }, (result) => {
        const incidents = result?.incidents || [];
        resolve(incidents.map(incident => ({
          type: incident.type,
          description: incident.description,
          location: {
            lat: incident.location.lat(),
            lng: incident.location.lng()
          }
        })));
      });
    });
  }

  private analyzeCongestionLevel(data: any): 'low' | 'medium' | 'high' {
    // Analyze traffic data to determine congestion level
    const speeds = data.snappedPoints?.map((point: any) => point.placeId) || [];
    const avgSpeed = speeds.reduce((sum: number, speed: number) => sum + speed, 0) / speeds.length;

    if (avgSpeed > 45) return 'low';
    if (avgSpeed > 25) return 'medium';
    return 'high';
  }

  private visualizeIncidents(trafficData: { incidents: Array<{ location: Coordinates }> }): void {
    if (!this.map) return;

    // Create heatmap data points from incidents
    const heatmapData = trafficData.incidents.map(incident => 
      new google.maps.LatLng(incident.location.lat, incident.location.lng)
    );

    // Initialize or update heatmap layer
    if (!this.trafficIncidentsLayer) {
      this.trafficIncidentsLayer = new google.maps.visualization.HeatmapLayer({
        data: heatmapData,
        map: this.map,
        radius: 50
      });
    } else {
      this.trafficIncidentsLayer.setData(heatmapData);
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

  private getTravelMode(activityType: string): google.maps.TravelMode {
    switch (activityType) {
      case 'bike':
        return google.maps.TravelMode.BICYCLING;
      case 'walk':
        return google.maps.TravelMode.WALKING;
      default:
        return google.maps.TravelMode.DRIVING;
    }
  }

  private renderRoute(
    route: google.maps.DirectionsRoute,
    style: {
      color?: string;
      width?: number;
      opacity?: number;
      isMain: boolean;
    }
  ): void {
    if (!this.map) return;

    // Clear existing route if this is the main route
    if (style.isMain && this.currentRoute) {
      this.currentRoute.setMap(null);
    }

    const path = new google.maps.Polyline({
      path: route.overview_path,
      geodesic: true,
      strokeColor: style.color || '#3F51B5',
      strokeOpacity: style.opacity || 1.0,
      strokeWeight: style.width || 5,
      map: this.map
    });

    if (style.isMain) {
      this.currentRoute = path;
    }
  }

  private visualizeTraffic(trafficData: TrafficData): void {
    if (!this.map) return;

    // Create traffic segments
    trafficData.segments.forEach(segment => {
      new google.maps.Polyline({
        path: [
          new google.maps.LatLng(segment.start[0], segment.start[1]),
          new google.maps.LatLng(segment.end[0], segment.end[1])
        ],
        strokeColor: getTrafficStyle(segment.congestion).color,
        strokeOpacity: 0.8,
        strokeWeight: 4,
        map: this.map
      });
    });

    // Add incidents if any
    if (trafficData.incidents?.length) {
      this.visualizeIncidents({ incidents: trafficData.incidents });
    }
  }

  private addInteractiveWaypoints(waypoints: RouteVisualization['waypoints']): void {
    if (!this.map || !waypoints) return;

    // Add start marker
    const startMarker = new google.maps.Marker({
      position: waypoints.start,
      map: this.map,
      icon: this.getMarkerIcon('start'),
      draggable: true
    });

    // Add end marker
    const endMarker = new google.maps.Marker({
      position: waypoints.end,
      map: this.map,
      icon: this.getMarkerIcon('end'),
      draggable: true
    });

    // Add waypoint markers
    waypoints.via.forEach((waypoint, index) => {
      const marker = new google.maps.Marker({
        position: waypoint,
        map: this.map,
        icon: this.getMarkerIcon('waypoint'),
        draggable: true
      });

      // Add drag event listener
      marker.addListener('dragend', () => {
        const position = marker.getPosition();
        if (position) {
          this.onWaypointDrag?.(index, {
            lat: position.lat(),
            lng: position.lng()
          });
        }
      });
    });
  }

  private processTrafficResponse(response: any): TrafficSegment[] {
    if (!response || !response.snappedPoints) return [];

    return response.snappedPoints.map((point: any, index: number, points: any[]) => {
      if (index === points.length - 1) return null;

      return {
        start: [point.location.lat(), point.location.lng()],
        end: [points[index + 1].location.lat(), points[index + 1].location.lng()],
        congestion: this.determineTrafficLevel(point.speedReading),
        speed: point.speedReading
      };
    }).filter(Boolean);
  }

  private determineTrafficLevel(speed: number): 'low' | 'moderate' | 'heavy' {
    if (speed > 45) return 'low';
    if (speed > 25) return 'moderate';
    return 'heavy';
  }

  async getRouteData(
    start: Coordinates,
    end: Coordinates,
    waypoints: Coordinates[] = [],
    activityType: ActivityType
  ): Promise<RouteVisualizationData> {
    if (!this.directionsService) {
      throw new Error('Directions service not initialized');
    }

    try {
      // Get route from Google
      const result = await this.directionsService.route({
        origin: start,
        destination: end,
        waypoints: waypoints.map(wp => ({ location: wp, stopover: true })),
        travelMode: this.getTravelMode(activityType),
        alternatives: true,
        provideRouteAlternatives: true
      });

      // Get traffic data
      const trafficData = await this.getTrafficForRoute(result.routes[0].overview_path);

      // Format data for Mapbox rendering
      return {
        path: result.routes[0].overview_path.map(point => [point.lng(), point.lat()]),
        traffic: {
          segments: this.processTrafficSegments(result.routes[0], trafficData),
          incidents: await this.getTrafficIncidents(result.routes[0].bounds)
        },
        alternatives: result.routes.slice(1).map(route => ({
          path: route.overview_path.map(point => [point.lng(), point.lat()]),
          duration: route.legs[0].duration.value,
          distance: route.legs[0].distance.value
        }))
      };
    } catch (error) {
      console.error('Failed to get route data:', error);
      throw error;
    }
  }

  private async getTrafficForRoute(path: google.maps.LatLng[]): Promise<TrafficSegment[]> {
    // Get traffic data from Google
    const trafficService = new google.maps.TrafficService();
    const result = await new Promise((resolve) => {
      trafficService.getTravelTimes({
        path,
        drivingOptions: {
          departureTime: new Date(),
          trafficModel: google.maps.TrafficModel.BEST_GUESS
        }
      }, (response) => resolve(response));
    });

    // Process and return traffic segments
    return this.processTrafficResponse(result);
  }
} 