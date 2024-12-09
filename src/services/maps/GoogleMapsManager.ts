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

export class GoogleMapsManager implements MapServiceInterface {
  private map: google.maps.Map | null = null;
  private markers: Map<string, google.maps.Marker> = new Map();
  private currentRoute: google.maps.Polyline | null = null;
  private trafficLayer: google.maps.TrafficLayer | null = null;
  private trafficIncidentsLayer: google.maps.visualization.HeatmapLayer | null = null;
  private directionsService: google.maps.DirectionsService | null = null;
  private placesService: google.maps.places.PlacesService | null = null;
  private userLocationMarker: google.maps.Marker | null = null;
  private userLocationOverlay: google.maps.OverlayView | null = null;
  private alternativeRoutes: google.maps.Polyline[] = [];
  private trafficLayerVisible = false;
  private directionsRenderer: google.maps.DirectionsRenderer | null = null;
  private mapStyles = {
    default: [
      // Light mode - clean, modern style
      {
        featureType: "all",
        elementType: "geometry",
        stylers: [{ visibility: "simplified" }]
      },
      {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#a2daf2" }]
      },
      {
        featureType: "landscape",
        elementType: "geometry",
        stylers: [{ color: "#f5f5f5" }]
      },
      {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#ffffff" }]
      },
      {
        featureType: "road",
        elementType: "geometry.stroke",
        stylers: [{ color: "#e6e6e6" }]
      },
      {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ color: "#ffffff" }]
      },
      {
        featureType: "poi",
        elementType: "geometry",
        stylers: [{ color: "#e8f0f9" }]
      },
      {
        featureType: "transit",
        elementType: "geometry",
        stylers: [{ color: "#e8f0f9" }]
      }
    ],
    dark: [
      // Dark mode - current style
      {
        elementType: "geometry",
        stylers: [{ color: "#242f3e" }]
      },
      {
        elementType: "labels.text.stroke",
        stylers: [{ color: "#242f3e" }]
      },
      {
        elementType: "labels.text.fill",
        stylers: [{ color: "#746855" }]
      },
      {
        featureType: "administrative.locality",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }]
      },
      {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#38414e" }]
      },
      {
        featureType: "road",
        elementType: "geometry.stroke",
        stylers: [{ color: "#212a37" }]
      },
      {
        featureType: "road",
        elementType: "labels.text.fill",
        stylers: [{ color: "#9ca5b3" }]
      },
      {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#17263c" }]
      },
      {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{ color: "#515c6d" }]
      },
      {
        featureType: "water",
        elementType: "labels.text.stroke",
        stylers: [{ color: "#17263c" }]
      },
      {
        featureType: "poi",
        elementType: "geometry",
        stylers: [{ color: "#283d6a" }]
      },
      {
        featureType: "transit",
        elementType: "geometry",
        stylers: [{ color: "#2f3948" }]
      }
    ]
  };
  private mapLayerDark = false;

  constructor() {
    // Remove the loader initialization as we'll use GoogleMapsLoader
  }

  async initialize(containerId: string, options?: { 
    style?: string;
    center?: Coordinates;
    zoom?: number;
    darkMode?: boolean;
  }): Promise<void> {
    console.log('Initializing map with options:', options);
    const google = await GoogleMapsLoader.getInstance().load();

    const element = document.getElementById(containerId);
    if (!element) throw new Error('Container element not found');

    const mapOptions: google.maps.MapOptions = {
      center: options?.center ?? { lat: 40.5852602, lng: -105.0749801 },
      zoom: options?.zoom ?? 12,
      styles: [
        { elementType: "geometry", stylers: [{ color: "#1a1a1a" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a1a" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#a8a29e" }] },
        {
          featureType: "administrative.locality",
          elementType: "labels.text.fill",
          stylers: [{ color: "#14b8a6" }],
        },
        {
          featureType: "poi",
          elementType: "labels.text.fill",
          stylers: [{ color: "#a8a29e" }],
        },
        {
          featureType: "poi.park",
          elementType: "geometry",
          stylers: [{ color: "#115e59" }],
        },
        {
          featureType: "poi.park",
          elementType: "labels.text.fill",
          stylers: [{ color: "#2dd4bf" }],
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#262626" }],
        },
        {
          featureType: "road",
          elementType: "geometry.stroke",
          stylers: [{ color: "#1a1a1a" }],
        },
        {
          featureType: "road",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d4d4d4" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry",
          stylers: [{ color: "#404040" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry.stroke",
          stylers: [{ color: "#1f2937" }],
        },
        {
          featureType: "road.highway",
          elementType: "labels.text.fill",
          stylers: [{ color: "#f5f5f5" }],
        },
        {
          featureType: "transit",
          elementType: "geometry",
          stylers: [{ color: "#262626" }],
        },
        {
          featureType: "transit.station",
          elementType: "labels.text.fill",
          stylers: [{ color: "#14b8a6" }],
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#083344" }],
        },
        {
          featureType: "water",
          elementType: "labels.text.fill",
          stylers: [{ color: "#0ea5e9" }],
        },
        {
          featureType: "water",
          elementType: "labels.text.stroke",
          stylers: [{ color: "#1a1a1a" }],
        },
      ],
      disableDefaultUI: true,
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: true,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: false,
      scrollwheel: true,
      gestureHandling: 'greedy'
    };

    this.map = new google.maps.Map(element, mapOptions);

    // Initialize services
    if (this.map) {
      this.directionsService = new google.maps.DirectionsService();
      this.placesService = new google.maps.places.PlacesService(this.map);
    }
  }

  getMap(): google.maps.Map | null {
    return this.map;
  }

  addClickListener(callback: (coords: Coordinates) => void): void {
    if (!this.map) return;
    this.map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        callback({
          lat: e.latLng.lat(),
          lng: e.latLng.lng()
        });
      }
    });
  }

  async addUserLocationMarker(location: Coordinates): Promise<void> {
    if (!this.map) return;

    // Remove existing marker and overlay
    if (this.userLocationMarker) {
      this.userLocationMarker.setMap(null);
      this.userLocationMarker = null;
    }
    if (this.userLocationOverlay) {
      this.userLocationOverlay.setMap(null);
      this.userLocationOverlay = null;
    }

    // Create marker with a small transparent icon
    const marker = new google.maps.Marker({
      position: location,
      map: this.map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 0,
        fillOpacity: 0,
        strokeOpacity: 0
      }
    });

    // Create custom overlay class
    class UserLocationOverlay extends google.maps.OverlayView {
      private div: HTMLDivElement | null = null;

      onAdd(): void {
        const div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.width = '18px';
        div.style.height = '18px';
        div.innerHTML = `
          <div style="position: relative; width: 100%; height: 100%;">
            <div style="position: absolute; width: 18px; height: 18px; background: #10b981; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);"></div>
            <div style="position: absolute; width: 18px; height: 18px; background: rgba(16, 185, 129, 0.4); border-radius: 50%; animation: pulse 2s ease-out infinite;"></div>
          </div>
        `;

        const style = document.createElement('style');
        style.textContent = `
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(3); opacity: 0; }
          }
        `;
        document.head.appendChild(style);

        this.div = div;
        const panes = this.getPanes();
        panes?.overlayImage.appendChild(div);
      }

      draw(): void {
        if (!this.div) return;
        const overlayProjection = this.getProjection();
        const position = overlayProjection.fromLatLngToDivPixel(
          new google.maps.LatLng(location.lat, location.lng)
        );
        
        if (position) {
          this.div.style.left = (position.x - 9) + 'px';
          this.div.style.top = (position.y - 9) + 'px';
        }
      }

      onRemove(): void {
        if (this.div) {
          this.div.parentNode?.removeChild(this.div);
          this.div = null;
        }
      }
    }

    // Create and add the overlay
    const overlay = new UserLocationOverlay();
    overlay.setMap(this.map);

    this.userLocationMarker = marker;
    this.userLocationOverlay = overlay;
  }

  setCenter(coordinates: Coordinates): void {
    if (!this.map) return;
    this.map.setCenter(coordinates);
  }

  setZoom(level: number): void {
    if (!this.map) return;
    this.map.setZoom(level);
  }

  addMarker(
    coordinates: Coordinates,
    options?: {
      type?: 'start' | 'end' | 'waypoint';
      draggable?: boolean;
      icon?: string;
      onClick?: () => void;
      onDragEnd?: (coords: Coordinates) => void;
    }
  ): string {
    if (!this.map) throw new Error('Map not initialized');

    const markerId = `marker-${Date.now()}`;
    const marker = new google.maps.Marker({
      position: coordinates,
      map: this.map,
      icon: this.getMarkerIcon(options?.type),
      draggable: options?.draggable
    });

    if (options?.onClick) {
      marker.addListener('click', options.onClick);
    }

    if (options?.onDragEnd) {
      marker.addListener('dragend', () => {
        const position = marker.getPosition();
        if (position) {
          options.onDragEnd?.({
            lat: position.lat(),
            lng: position.lng()
          });
        }
      });
    }

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

  public async drawRoute(
    route: RouteVisualization,
    options: RouteOptions
  ): Promise<void> {
    if (!this.map || !this.directionsService) return;

    // Clear existing routes and markers
    this.clearRoute();

    try {
      const request: google.maps.DirectionsRequest = {
        origin: route.waypoints.start,
        destination: route.waypoints.end,
        travelMode: google.maps.TravelMode.DRIVING,  // Force driving mode
      };

      const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
        this.directionsService?.route(request, (response, status) => {
          if (status === google.maps.DirectionsStatus.OK && response) {
            resolve(response);
          } else {
            reject(new Error(`Directions request failed: ${status}`));
          }
        });
      });

      // Use DirectionsRenderer only
      this.directionsRenderer = new google.maps.DirectionsRenderer({
        map: this.map,
        directions: result,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#FFFFFF',
          strokeOpacity: 0.8,
          strokeWeight: 5
        }
      });

      // Add markers
      await this.addMarker(route.waypoints.start, { type: 'start' });
      await this.addMarker(route.waypoints.end, { type: 'end' });

      // Fit bounds
      const bounds = new google.maps.LatLngBounds();
      result.routes[0].overview_path.forEach(point => bounds.extend(point));
      this.map.fitBounds(bounds);

    } catch (error) {
      console.error('Failed to draw route:', error);
      throw error;
    }
  }

  private async visualizeTrafficData(trafficData: TrafficData): Promise<void> {
    if (!this.map) return;

    // Visualize traffic segments with color-coding
    trafficData.segments?.forEach(segment => {
      const color = this.getTrafficColor(segment.congestion);
      new google.maps.Polyline({
        path: [
          { lat: segment.start.lat, lng: segment.start.lng },
          { lat: segment.end.lat, lng: segment.end.lng }
        ],
        strokeColor: color,
        strokeOpacity: 0.7,
        strokeWeight: 4,
        map: this.map
      });
    });

    // Show traffic incidents if any
    trafficData.incidents.forEach(incident => {
      this.addMarker(incident.location, {
        icon: this.getIncidentIcon(incident.severity),
        onClick: () => {
          // Show incident details in an InfoWindow
          this.showIncidentDetails(incident);
        }
      });
    });
  }

  private getTrafficColor(congestion: 'low' | 'medium' | 'high'): string {
    switch (congestion) {
      case 'low':
        return '#22c55e'; // Brighter green
      case 'medium':
        return '#eab308'; // Brighter yellow
      case 'high':
        return '#ef4444'; // Brighter red
      default:
        return '#94a3b8'; // Brighter gray
    }
  }

  private getIncidentIcon(severity: 'low' | 'medium' | 'high'): string {
    // Return appropriate icon URL based on severity
    return `/icons/traffic-incident-${severity}.png`;
  }

  private showIncidentDetails(incident: TrafficData['incidents'][0]): void {
    if (!this.map) return;

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div class="p-4">
          <h3 class="font-semibold">${incident.type}</h3>
          <p>${incident.description}</p>
          <p class="text-sm text-gray-500">
            ${incident.startTime ? new Date(incident.startTime).toLocaleString() : 'Ongoing'}
          </p>
        </div>
      `
    });

    infoWindow.setPosition(incident.location);
    infoWindow.open(this.map);
  }

  private fitRouteBounds(path: google.maps.LatLngLiteral[]): void {
    if (!this.map || !path.length) return;

    const bounds = new google.maps.LatLngBounds();
    path.forEach(point => bounds.extend(point));
    this.map.fitBounds(bounds, { padding: 50 });
  }

  private async updateRouteWithWaypoint(newWaypoint: Coordinates): Promise<void> {
    // This will be implemented when we add waypoint drag functionality
    console.log('Waypoint updated:', newWaypoint);
  }

  public clearRoute(): void {
    // Clear directions renderer
    if (this.directionsRenderer) {
      this.directionsRenderer.setMap(null);
      this.directionsRenderer = null;
    }

    // Clear any polylines
    if (this.currentRoute) {
      this.currentRoute.setMap(null);
      this.currentRoute = null;
    }

    // Clear alternative routes
    this.clearAlternativeRoutes();

    // Clear markers
    this.markers.forEach(marker => marker.setMap(null));
    this.markers.clear();
  }

  public async setTrafficLayer(visible: boolean): Promise<void> {
    if (!this.map) return;

    try {
      this.trafficLayerVisible = visible;
      
      if (visible) {
        if (!this.trafficLayer) {
          this.trafficLayer = new google.maps.TrafficLayer();
        }
        this.trafficLayer.setMap(this.map);
      } else {
        if (this.trafficLayer) {
          this.trafficLayer.setMap(null);
        }
      }
    } catch (error) {
      console.error('Error toggling traffic layer:', error);
      throw error; // Propagate error to handle in UI
    }
  }

  async getTrafficData(bounds: MapBounds): Promise<TrafficData> {
    if (!this.map) throw new Error('Map not initialized');

    try {
      // Use Google Maps Traffic Layer instead of Roads API
      const trafficLayer = new google.maps.TrafficLayer();
      
      return {
        congestionLevel: 'medium', // Default value
        incidents: [], // We'll implement this separately
        segments: [] // We'll implement this separately
      };
    } catch (error) {
      console.error('Failed to fetch traffic data:', error);
      return {
        congestionLevel: 'low',
        incidents: [],
        segments: []
      };
    }
  }

  private determineSeverity(incident: any): 'low' | 'moderate' | 'heavy' {
    // Add logic to determine severity based on incident type/data
    return 'moderate';
  }

  private async fetchTrafficIncidents(bounds: google.maps.LatLngBounds): Promise<Array<{
    type: string;
    description: string;
    location: Coordinates;
    severity: 'low' | 'moderate' | 'heavy';
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
          },
          severity: this.determineSeverity(incident)
        })));
      });
    });
  }

  private analyzeCongestionLevel(data: {
    snappedPoints?: Array<{
      placeId: number;
      location: {
        latitude: number;
        longitude: number;
      };
    }>;
  }): 'low' | 'moderate' | 'heavy' {
    const speeds = data.snappedPoints?.map(point => point.placeId) || [];
    const avgSpeed = speeds.reduce((sum: number, speed: number) => sum + speed, 0) / speeds.length;

    if (avgSpeed > 45) return 'low';
    if (avgSpeed > 25) return 'moderate';
    return 'heavy';
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

  private getMarkerIcon(type?: 'start' | 'end' | 'waypoint'): google.maps.Symbol | google.maps.Icon {
    if (!type) return undefined;

    switch (type) {
      case 'start':
        return {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#10b981', // Teal
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        };
      case 'end':
        return {
          path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
          fillColor: '#ef4444', // Red
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 2,
          anchor: new google.maps.Point(12, 22)
        };
      default:
        return {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#6b7280', // Gray
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        };
    }
  }

  private getTravelMode(activityType: string): google.maps.TravelMode {
    switch (activityType.toLowerCase()) {
      case 'car':
        return google.maps.TravelMode.DRIVING;
      case 'bike':
        return google.maps.TravelMode.BICYCLING;
      case 'walk':
        return google.maps.TravelMode.WALKING;
      default:
        console.warn('Unknown activity type:', activityType);
        return google.maps.TravelMode.DRIVING;
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

  cleanup(): void {
    if (this.map) {
      google.maps.event.clearInstanceListeners(this.map);
    }
    if (this.userLocationMarker) {
      this.userLocationMarker.setMap(null);
    }
    this.markers.forEach(marker => {
      marker.setMap(null);
    });
    this.markers.clear();
  }

  async generateDirectionsRoute(start: Coordinates, end: Coordinates): Promise<google.maps.DirectionsResult> {
    if (!this.directionsService || !this.map) {
      throw new Error('Map or DirectionsService not initialized');
    }

    const request: google.maps.DirectionsRequest = {
      origin: start,
      destination: end,
      travelMode: google.maps.TravelMode.DRIVING
    };

    return new Promise((resolve, reject) => {
      this.directionsService?.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          // Create DirectionsRenderer to display the route
          const directionsRenderer = new google.maps.DirectionsRenderer({
            map: this.map,
            suppressMarkers: true, // We'll handle markers ourselves
            polylineOptions: {
              strokeColor: '#10b981', // Teal color
              strokeWeight: 4,
              strokeOpacity: 0.8
            }
          });
          directionsRenderer.setDirections(result);
          resolve(result);
        } else {
          reject(new Error('Failed to generate route'));
        }
      });
    });
  }

  public showAlternativeRoutes(routes: RouteVisualization['alternatives']): void {
    if (!this.map || !routes) return;
    
    routes.forEach((route, index) => {
      const path = route.coordinates.map(coord => ({
        lat: coord.lat,
        lng: coord.lng
      }));

      new google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: '#6b7280', // Gray color for alternatives
        strokeOpacity: 0.6,
        strokeWeight: 3,
        map: this.map
      });
    });
  }

  public hideAlternativeRoutes(): void {
    // Clear alternative routes logic here
    // This will be implemented when we store references to alternative polylines
  }

  public addControls(options: {
    navigation?: boolean;
    geolocate?: boolean;
    scale?: boolean;
    fullscreen?: boolean;
  }): void {
    if (!this.map) return;

    this.map.setOptions({
      zoomControl: options.navigation,
      scaleControl: options.scale,
      fullscreenControl: options.fullscreen
    });
  }

  public on(event: 'click' | 'move' | 'zoom' | 'dragend', callback: (e: any) => void): void {
    if (!this.map) return;
    this.map.addListener(event, callback);
  }

  public off(event: 'click' | 'move' | 'zoom' | 'dragend', callback: (e: any) => void): void {
    if (!this.map) return;
    google.maps.event.removeListener(callback);
  }

  public fitBounds(bounds: MapBounds, options?: { padding?: number }): void {
    if (!this.map) return;
    
    const googleBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(bounds.south, bounds.west),
      new google.maps.LatLng(bounds.north, bounds.east)
    );
    
    this.map.fitBounds(googleBounds, options);
  }

  public panTo(coordinates: Coordinates, options?: { duration?: number }): void {
    if (!this.map) return;
    this.map.panTo(coordinates);
  }

  public addLayer(layerId: string, options: any): void {
    // Implement when needed for specific layer types
  }

  public removeLayer(layerId: string): void {
    // Implement when needed for specific layer types
  }

  public setLayerVisibility(layerId: string, visible: boolean): void {
    // Implement when needed for specific layer types
  }

  public getBounds(): MapBounds {
    if (!this.map) throw new Error('Map not initialized');
    const bounds = this.map.getBounds();
    if (!bounds) throw new Error('Map bounds not available');
    
    return {
      north: bounds.getNorthEast().lat(),
      south: bounds.getSouthWest().lat(),
      east: bounds.getNorthEast().lng(),
      west: bounds.getSouthWest().lng()
    };
  }

  public getCenter(): Coordinates {
    if (!this.map) throw new Error('Map not initialized');
    const center = this.map.getCenter();
    if (!center) throw new Error('Map center not available');
    
    return {
      lat: center.lat(),
      lng: center.lng()
    };
  }

  public getZoom(): number {
    if (!this.map) throw new Error('Map not initialized');
    return this.map.getZoom() || 12;
  }

  public updateMarker(markerId: string, coordinates: Coordinates): void {
    const marker = this.markers.get(markerId);
    if (marker) {
      marker.setPosition(coordinates);
    }
  }

  public async visualizeRoute(route: Route): Promise<void> {
    if (!this.map) throw new Error('Map not initialized');
    
    // Clear existing route
    this.clearRoute();

    // Create path from route segments
    const path = route.segments.flatMap(segment => [
      { lat: segment.startPoint.latitude, lng: segment.startPoint.longitude },
      { lat: segment.endPoint.latitude, lng: segment.endPoint.longitude }
    ]);

    // Create and render the route polyline
    this.currentRoute = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#10b981', // Teal color matching the theme
      strokeOpacity: 0.8,
      strokeWeight: 4,
      map: this.map
    });

    // Add markers for start and end points if needed
    const startPoint = path[0];
    const endPoint = path[path.length - 1];

    await this.addMarker(startPoint, { type: 'start' });
    await this.addMarker(endPoint, { type: 'end' });

    // Fit bounds to show the entire route
    const bounds = new google.maps.LatLngBounds();
    path.forEach(point => bounds.extend(point));
    this.map.fitBounds(bounds);
  }

  public async generateRoute(
    start: Coordinates,
    end: Coordinates,
    options?: {
      waypoints?: Coordinates[];
      activityType?: 'car' | 'bike' | 'walk';
      alternatives?: boolean;
    }
  ): Promise<RouteVisualization> {
    if (!this.directionsService || !this.map) {
      throw new Error('Map or DirectionsService not initialized');
    }

    console.log('Generating route with mode:', options?.activityType || 'car'); // Debug log

    const request: google.maps.DirectionsRequest = {
      origin: start,
      destination: end,
      travelMode: this.getTravelMode(options?.activityType || 'car'),
      provideRouteAlternatives: options?.alternatives
    };

    try {
      const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
        this.directionsService?.route(request, (response, status) => {
          if (status === google.maps.DirectionsStatus.OK && response) {
            resolve(response);
          } else {
            reject(new Error(`Route generation failed: ${status}`));
          }
        });
      });

      return {
        mainRoute: {
          coordinates: this.extractCoordinates(result.routes[0].overview_path),
          distance: result.routes[0].legs[0].distance?.value,
          duration: result.routes[0].legs[0].duration?.value
        },
        waypoints: {
          start,
          end,
          via: options?.waypoints || []
        }
      };
    } catch (error) {
      console.error('Failed to generate route:', error);
      throw error;
    }
  }

  private extractCoordinates(path: google.maps.LatLng[]): Coordinates[] {
    return path.map(point => ({
      lat: point.lat(),
      lng: point.lng()
    }));
  }

  private async getRouteTrafficData(
    route: google.maps.DirectionsRoute
  ): Promise<TrafficData | undefined> {
    try {
      const bounds = new google.maps.LatLngBounds();
      route.overview_path.forEach(point => bounds.extend(point));
      
      const mapBounds: MapBounds = {
        north: bounds.getNorthEast().lat(),
        south: bounds.getSouthWest().lat(),
        east: bounds.getNorthEast().lng(),
        west: bounds.getSouthWest().lng()
      };

      return await this.getTrafficData(mapBounds);
    } catch (error) {
      console.error('Failed to get traffic data:', error);
      return undefined;
    }
  }

  private clearAlternativeRoutes(): void {
    this.alternativeRoutes.forEach(route => route.setMap(null));
    this.alternativeRoutes = [];
  }

  public async handleToolAction(tool: 'ROUTE' | 'SEARCH' | 'TRAFFIC' | 'LAYERS'): Promise<void> {
    if (!this.map) return;

    try {
      switch (tool) {
        case 'LAYERS':
          this.mapLayerDark = !this.mapLayerDark;
          this.map.setOptions({
            styles: this.mapLayerDark ? this.mapStyles.dark : this.mapStyles.default
          });
          break;
        case 'TRAFFIC':
          await this.setTrafficLayer(!this.trafficLayerVisible);
          break;
        case 'ROUTE':
          this.clearRoute();
          break;
        case 'SEARCH':
          // Search functionality will be implemented separately
          break;
      }
    } catch (error) {
      console.error('Error handling tool action:', error);
      throw error;
    }
  }
} 