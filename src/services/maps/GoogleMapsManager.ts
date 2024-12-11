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

export class GoogleMapsManager implements MapServiceInterface {
  private map: google.maps.Map | null = null;
  private markers: Map<string, google.maps.marker.AdvancedMarkerElement> = new Map();
  private currentRoute: google.maps.Polyline | null = null;
  private trafficLayer: google.maps.TrafficLayer | null = null;
  private trafficIncidentsLayer: google.maps.visualization.HeatmapLayer | null = null;
  private directionsService: google.maps.DirectionsService | null = null;
  private placesService: google.maps.places.PlacesService | null = null;
  private userLocationMarker: google.maps.marker.AdvancedMarkerElement | null = null;
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
        stylers: [{ color: "#1B1B1B" }]
      },
      {
        elementType: "labels.text.stroke",
        stylers: [{ color: "#1B1B1B" }]
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
  private alternativeRenderers: google.maps.DirectionsRenderer[] = [];
  private destinationMarkers: Set<google.maps.Marker> = new Set();
  private destinationOverlays: Set<google.maps.OverlayView> = new Set();
  private currentMarkers = {
    start: null as google.maps.Marker | null,
    end: null as google.maps.Marker | null,
    overlays: new Set<google.maps.OverlayView>()
  };
  private suggestionMarkers: Map<string, google.maps.Marker> = new Map();
  private suggestionOverlays: Set<google.maps.OverlayView> = new Set();
  private readonly googleMaps: typeof google.maps;

  constructor() {
    this.googleMaps = google.maps;
  }

  setMapInstance(map: google.maps.Map) {
    this.map = map;
  }

  getMap() {
    return this.map;
  }

  cleanup() {
    this.map = null;
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

    this._map = new google.maps.Map(element, mapOptions);

    // Initialize services
    if (this._map) {
      this.directionsService = new google.maps.DirectionsService();
      this.placesService = new google.maps.places.PlacesService(this._map);
    }
  }

  public getMap(): google.maps.Map | null {
    return this._map;
  }

  addClickListener(callback: (coords: Coordinates) => void): void {
    if (!this._map) return;
    this._map.addListener('click', (e: google.maps.MapMouseEvent) => {
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

    // Remove existing marker if any
    if (this.userLocationMarker) {
      this.userLocationMarker.map = null;
    }

    // Create marker using standard Marker for now (fallback)
    if (!google.maps.marker?.AdvancedMarkerElement) {
      const marker = new google.maps.Marker({
        position: location,
        map: this.map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: '#10B981',
          fillOpacity: 0.9,
          strokeColor: '#4B5563',
          strokeWeight: 1.5,
          strokeOpacity: 0.8
        }
      });

      // Store as any since we're mixing marker types
      this.userLocationMarker = marker as any;
      return;
    }

    // If AdvancedMarkerElement is available, use it
    try {
      const markerView = new google.maps.marker.PinElement({
        scale: 1.2,
        background: '#10B981',
        borderColor: '#4B5563',
        glyphColor: '#FFFFFF'
      });

      this.userLocationMarker = new google.maps.marker.AdvancedMarkerElement({
        map: this.map,
        position: location,
        content: markerView.element,
        title: 'Your Location'
      });

      if (this.userLocationMarker.content) {
        const element = this.userLocationMarker.content as HTMLElement;
        element.style.animation = 'pulse 2s infinite';
        
        if (!document.getElementById('marker-pulse-animation')) {
          const style = document.createElement('style');
          style.id = 'marker-pulse-animation';
          style.textContent = `
            @keyframes pulse {
              0% { transform: scale(1); opacity: 1; }
              70% { transform: scale(1.3); opacity: 0.7; }
              100% { transform: scale(1.5); opacity: 0; }
            }
          `;
          document.head.appendChild(style);
        }
      }
    } catch (error) {
      console.error('Error creating advanced marker:', error);
      // Fallback to standard marker if advanced marker fails
      this.addUserLocationMarker(location);
    }
  }

  setCenter(coordinates: Coordinates): void {
    if (!this._map) return;
    this._map.setCenter(coordinates);
  }

  setZoom(level: number): void {
    if (!this._map) return;
    this._map.setZoom(level);
  }

  async addMarker(
    coordinates: Coordinates,
    options: {
      type?: 'start' | 'end' | 'waypoint';
      title?: string;
      onClick?: () => void;
    } = {}
  ): Promise<string> {
    if (!this.map) return '';

    const markerId = `marker-${Date.now()}`;
    
    const markerView = new google.maps.marker.PinElement({
      scale: 1,
      background: this.getMarkerColor(options.type),
      borderColor: '#374151',
      glyphColor: '#FFFFFF'
    });

    const marker = new google.maps.marker.AdvancedMarkerElement({
      map: this.map,
      position: coordinates,
      content: markerView.element,
      title: options.title
    });

    if (options.onClick) {
      marker.addListener('click', options.onClick);
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
    if (!this._map || !this.directionsService) return;

    this.clearRoute();

    try {
      const request: google.maps.DirectionsRequest = {
        origin: route.waypoints.start,
        destination: route.waypoints.end,
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true,
        optimizeWaypoints: true,
        // Add these parameters to encourage alternative routes
        avoidHighways: false,
        avoidTolls: false
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

      // Draw alternative routes first with subtle styling
      if (options.showAlternatives && result.routes.length > 1) {
        result.routes.slice(1).forEach((_, index) => {
          const alternativeRenderer = new google.maps.DirectionsRenderer({
            map: this._map,
            directions: result,
            routeIndex: index + 1,
            suppressMarkers: true,
            zIndex: 1,
            polylineOptions: {
              strokeColor: '#FDE68A',
              strokeOpacity: 0.35,
              strokeWeight: 3
            }
          });
          this.alternativeRenderers.push(alternativeRenderer);
        });
      }

      // Draw main route with outline effect
      this.directionsRenderer = new google.maps.DirectionsRenderer({
        map: this._map,
        directions: result,
        routeIndex: 0,
        suppressMarkers: true,
        zIndex: 2,
        polylineOptions: {
          path: result.routes[0].overview_path,
          strokeColor: '#374151',
          strokeOpacity: 0.35,
          strokeWeight: 5
        }
      });

      // Draw the main colored line on top
      const mainRoute = new google.maps.Polyline({
        path: result.routes[0].overview_path,
        strokeColor: '#8B5CF6',
        strokeOpacity: 0.8,
        strokeWeight: 3,
        zIndex: 3,
        map: this._map
      });

      // Store reference for cleanup
      this.currentRoute = mainRoute;

      // Add markers
      await this.addMarker(route.waypoints.start, { type: 'start' });
      await this.addMarker(route.waypoints.end, { type: 'end' });

      // Fit bounds
      const bounds = new google.maps.LatLngBounds();
      result.routes[0].overview_path.forEach(point => bounds.extend(point));
      this._map.fitBounds(bounds);

    } catch (error) {
      console.error('Failed to draw route:', error);
      throw error;
    }
  }

  private async visualizeTrafficData(trafficData: TrafficData): Promise<void> {
    if (!this._map) return;

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
        map: this._map
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
    if (!this._map) return;

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
    infoWindow.open(this._map);
  }

  private fitRouteBounds(path: google.maps.LatLngLiteral[]): void {
    if (!this._map || !path.length) return;

    const bounds = new google.maps.LatLngBounds();
    path.forEach(point => bounds.extend(point));
    this._map.fitBounds(bounds, { padding: 50 });
  }

  private async updateRouteWithWaypoint(newWaypoint: Coordinates): Promise<void> {
    // This will be implemented when we add waypoint drag functionality
    console.log('Waypoint updated:', newWaypoint);
  }

  public clearDirectionsRenderer(): void {
    if (this.directionsRenderer) {
      this.directionsRenderer.setMap(null);
      this.directionsRenderer = null;
    }
  }

  public clearRoute(): void {
    // Clear existing route
    if (this.currentRoute) {
      this.currentRoute.setMap(null);
      this.currentRoute = null;
    }

    // Clear alternative routes
    this.alternativeRoutes.forEach(route => route.setMap(null));
    this.alternativeRoutes = [];

    // Clear all markers
    this.markers.forEach(marker => marker.setMap(null));
    this.markers.clear();

    // Clear current markers
    if (this.currentMarkers.start) {
      this.currentMarkers.start.setMap(null);
      this.currentMarkers.start = null;
    }
    if (this.currentMarkers.end) {
      this.currentMarkers.end.setMap(null);
      this.currentMarkers.end = null;
    }

    // Clear all overlays
    this.currentMarkers.overlays.forEach(overlay => overlay.setMap(null));
    this.currentMarkers.overlays.clear();

    // Clear suggestion markers
    this.suggestionMarkers.forEach(marker => marker.setMap(null));
    this.suggestionMarkers.clear();

    // Clear suggestion overlays
    this.suggestionOverlays.forEach(overlay => overlay.setMap(null));
    this.suggestionOverlays.clear();

    // Clear directions renderer
    if (this.directionsRenderer) {
      this.directionsRenderer.setMap(null);
      this.directionsRenderer = null;
    }

    // Clear alternative renderers
    this.alternativeRenderers.forEach(renderer => {
      renderer.setMap(null);
    });
    this.alternativeRenderers = [];
  }

  public async setTrafficLayer(visible: boolean): Promise<void> {
    if (!this._map) return;

    try {
      this.trafficLayerVisible = visible;
      
      if (visible) {
        if (!this.trafficLayer) {
          this.trafficLayer = new google.maps.TrafficLayer({
            autoRefresh: true
          });
        }
        this.trafficLayer.setMap(this._map);
        
        // Add a slight transparency to the route to make traffic more visible
        if (this.directionsRenderer) {
          const currentOptions = this.directionsRenderer.getOptions();
          this.directionsRenderer.setOptions({
            ...currentOptions,
            polylineOptions: {
              ...currentOptions.polylineOptions,
              strokeOpacity: 0.7
            }
          });
        }
      } else {
        if (this.trafficLayer) {
          this.trafficLayer.setMap(null);
        }
        // Restore route opacity
        if (this.directionsRenderer) {
          const currentOptions = this.directionsRenderer.getOptions();
          this.directionsRenderer.setOptions({
            ...currentOptions,
            polylineOptions: {
              ...currentOptions.polylineOptions,
              strokeOpacity: 0.9
            }
          });
        }
      }
    } catch (error) {
      console.error('Error toggling traffic layer:', error);
      throw error;
    }
  }

  async getTrafficData(bounds: MapBounds): Promise<TrafficData> {
    if (!this._map) throw new Error('Map not initialized');

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
    if (!this._map) return;

    // Create heatmap data points from incidents
    const heatmapData = trafficData.incidents.map(incident => 
      new google.maps.LatLng(incident.location.lat, incident.location.lng)
    );

    // Initialize or update heatmap layer
    if (!this.trafficIncidentsLayer) {
      this.trafficIncidentsLayer = new google.maps.visualization.HeatmapLayer({
        data: heatmapData,
        map: this._map,
        radius: 50
      });
    } else {
      this.trafficIncidentsLayer.setData(heatmapData);
    }
  }

  private getMarkerIcon(type?: 'start' | 'end' | 'waypoint'): google.maps.Symbol {
    if (!type) return undefined;

    switch (type) {
      case 'start':
        return {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#10b981', // Teal
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 1
        };
      case 'end':
        return {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#8B5CF6', // Violet-500
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 1
        };
      default:
        return {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: '#6b7280', // Gray
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 1
        };
    }
  }

  private createPulsingMarker(coordinates: Coordinates, color: string): google.maps.OverlayView {
    class PulsingMarkerOverlay extends google.maps.OverlayView {
      private div: HTMLDivElement | null = null;

      onAdd(): void {
        const div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.width = '10px';
        div.style.height = '10px';

        const glowIntensity = '14px';
        const pulseOpacity = '1';
        const pulseColor = color === '#EC4899' ? '#F472B6' : color;

        div.innerHTML = `
          <div style="position: relative; width: 100%; height: 100%;">
            <div style="position: absolute; width: 10px; height: 10px; background: ${color}; border: 1.8px solid #374151; border-radius: 50%; box-shadow: 0 0 ${glowIntensity} ${pulseColor}"></div>
            <div style="position: absolute; width: 10px; height: 10px; background: ${pulseColor}40; border-radius: 50%; animation: pulse-${color.replace('#', '')} 2s ease-out infinite;"></div>
          </div>
        `;

        const style = document.createElement('style');
        style.textContent = `
          @keyframes pulse-${color.replace('#', '')} {
            0% { transform: scale(1); opacity: ${pulseOpacity}; }
            70% { transform: scale(2.0625); opacity: 0.5; }
            100% { transform: scale(2.475); opacity: 0; }
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
          new google.maps.LatLng(coordinates.lat, coordinates.lng)
        );
        
        if (position) {
          this.div.style.left = (position.x - 5) + 'px';
          this.div.style.top = (position.y - 5) + 'px';
        }
      }

      onRemove(): void {
        if (this.div) {
          this.div.parentNode?.removeChild(this.div);
          this.div = null;
        }
      }
    }

    const overlay = new PulsingMarkerOverlay();
    overlay.setMap(this._map);
    return overlay;
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
    if (!this._map) return;

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
        map: this._map
      });
    });

    // Add incidents if any
    if (trafficData.incidents?.length) {
      this.visualizeIncidents({ incidents: trafficData.incidents });
    }
  }

  private addInteractiveWaypoints(waypoints: RouteVisualization['waypoints']): void {
    if (!this._map || !waypoints) return;

    // Add start marker
    const startMarker = new google.maps.Marker({
      position: waypoints.start,
      map: this._map,
      icon: this.getMarkerIcon('start'),
      draggable: true
    });

    // Add end marker
    const endMarker = new google.maps.Marker({
      position: waypoints.end,
      map: this._map,
      icon: this.getMarkerIcon('end'),
      draggable: true
    });

    // Add waypoint markers
    waypoints.via.forEach((waypoint, index) => {
      const marker = new google.maps.Marker({
        position: waypoint,
        map: this._map,
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
    if (this._map) {
      google.maps.event.clearInstanceListeners(this._map);
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
    if (!this.directionsService || !this._map) {
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
            map: this._map,
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
    if (!this._map || !routes) return;
    
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
        map: this._map
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
    if (!this._map) return;

    this._map.setOptions({
      zoomControl: options.navigation,
      scaleControl: options.scale,
      fullscreenControl: options.fullscreen
    });
  }

  public on(event: 'click' | 'move' | 'zoom' | 'dragend', callback: (e: any) => void): void {
    if (!this._map) return;
    this._map.addListener(event, callback);
  }

  public off(event: 'click' | 'move' | 'zoom' | 'dragend', callback: (e: any) => void): void {
    if (!this._map) return;
    google.maps.event.removeListener(callback);
  }

  public fitBounds(bounds: MapBounds, options?: { padding?: number }): void {
    if (!this._map) return;
    
    const googleBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(bounds.south, bounds.west),
      new google.maps.LatLng(bounds.north, bounds.east)
    );
    
    this._map.fitBounds(googleBounds, options);
  }

  public panTo(coordinates: Coordinates, options?: { duration?: number }): void {
    if (!this._map) return;
    this._map.panTo(coordinates);
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
    if (!this._map) throw new Error('Map not initialized');
    const bounds = this._map.getBounds();
    if (!bounds) throw new Error('Map bounds not available');
    
    return {
      north: bounds.getNorthEast().lat(),
      south: bounds.getSouthWest().lat(),
      east: bounds.getNorthEast().lng(),
      west: bounds.getSouthWest().lng()
    };
  }

  public getCenter(): Coordinates {
    if (!this._map) throw new Error('Map not initialized');
    const center = this._map.getCenter();
    if (!center) throw new Error('Map center not available');
    
    return {
      lat: center.lat(),
      lng: center.lng()
    };
  }

  public getZoom(): number {
    if (!this._map) throw new Error('Map not initialized');
    return this._map.getZoom() || 12;
  }

  public updateMarker(markerId: string, coordinates: Coordinates): void {
    const marker = this.markers.get(markerId);
    if (marker) {
      marker.setPosition(coordinates);
    }
  }

  public async visualizeRoute(route: MapVisualization): Promise<void> {
    if (!this._map) throw new Error('Map not initialized');

    // Clear existing route
    this.clearVisualization();

    try {
      // Draw main route
      const mainPolyline = new google.maps.Polyline({
        path: route.mainRoute.coordinates,
        geodesic: true,
        strokeColor: this.getSegmentColor(route.mainRoute),
        strokeOpacity: 0.8,
        strokeWeight: 4,
        map: this._map
      });
      this.activeSegments.push(mainPolyline);

      // Draw alternatives if they exist
      if (route.alternatives?.length) {
        route.alternatives.forEach(alt => {
          const altPolyline = new google.maps.Polyline({
            path: alt.coordinates,
            geodesic: true,
            strokeColor: this.getSegmentColor(alt),
            strokeOpacity: 0.6,
            strokeWeight: 3,
            map: this._map
          });
          this.alternativeRoutes.push(altPolyline);
        });
      }

      // Add waypoints if they exist
      if (route.waypoints) {
        await this.addWaypoints(route.waypoints);
      }

      // Show traffic data if available
      if (route.mainRoute.trafficData) {
        await this.visualizeTrafficData(route.mainRoute.trafficData);
      }

      // Fit bounds to show entire route
      this.fitRouteBounds(route);
    } catch (error) {
      console.error('Error visualizing route:', error);
      throw error;
    }
  }

  private getSegmentColor(segment: RouteVisualizationSegment): string {
    const colors = {
      road: '#4285F4',
      trail: '#34A853',
      ski: '#EA4335',
      connection: '#FBBC05'
    };
    return colors[segment.type] || colors.road;
  }

  public async generateRoute(
    start: Coordinates,
    end: Coordinates,
    options?: {
      waypoints?: google.maps.DirectionsWaypoint[];
      activityType?: 'car' | 'bike' | 'walk';
      alternatives?: boolean;
    }
  ): Promise<RouteVisualization> {
    if (!this.directionsService || !this._map) {
      throw new Error('Map or DirectionsService not initialized');
    }

    const request: google.maps.DirectionsRequest = {
      origin: start,
      destination: end,
      waypoints: options?.waypoints,
      optimizeWaypoints: true,
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
    if (!this._map) return;

    try {
      switch (tool) {
        case 'LAYERS':
          this.mapLayerDark = !this.mapLayerDark;
          this._map.setOptions({
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

  public async visualizeSuggestions(suggestions: ChatSuggestion[]) {
    // Clear any existing suggestion markers
    this.clearSuggestionMarkers();

    suggestions.forEach(suggestion => {
      const marker = new google.maps.Marker({
        position: suggestion.location,
        map: this._map,
        title: suggestion.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: this.getSuggestionColor(suggestion.type),
          fillOpacity: 0.7,
          strokeWeight: 2,
          strokeColor: '#ffffff'
        }
      });

      // Add click listener
      marker.addListener('click', () => {
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div class="p-2">
              <h3 class="font-medium text-lg">${suggestion.name}</h3>
              <p class="text-sm text-gray-600">${suggestion.description}</p>
            </div>
          `
        });
        infoWindow.open(this._map, marker);
      });

      this.suggestionMarkers.set(suggestion.name, marker);
    });

    // Fit bounds to include all markers
    if (suggestions.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      suggestions.forEach(s => bounds.extend(s.location));
      this._map.fitBounds(bounds, 50); // 50px padding
    }
  }

  private getSuggestionColor(type: string): string {
    switch (type) {
      case 'attraction':
        return '#10B981'; // Emerald
      case 'rest':
        return '#6366F1'; // Indigo
      case 'viewpoint':
        return '#F59E0B'; // Amber
      default:
        return '#6B7280'; // Gray
    }
  }

  private clearSuggestionMarkers(): void {
    this.suggestionMarkers.forEach(marker => marker.setMap(null));
    this.suggestionMarkers.clear();
    this.suggestionOverlays.forEach(overlay => overlay.setMap(null));
    this.suggestionOverlays.clear();
  }

  private getMarkerColor(type?: 'start' | 'end' | 'waypoint'): string {
    switch (type) {
      case 'start':
        return '#10B981'; // emerald-500
      case 'end':
        return '#EC4899'; // pink-500
      case 'waypoint':
        return '#6366F1'; // indigo-500
      default:
        return '#6B7280'; // stone-500
    }
  }

  async getDirections(params: {
    origin: string | google.maps.LatLng;
    destination: string | google.maps.LatLng;
    mode: 'driving' | 'walking' | 'bicycling' | 'transit';
  }): Promise<{
    path: google.maps.LatLng[];
    distance: number;
    duration: number;
    polyline: string;
  }> {
    const directionsService = new this.googleMaps.DirectionsService();
    
    try {
      const result = await directionsService.route({
        origin: params.origin,
        destination: params.destination,
        travelMode: params.mode.toUpperCase() as google.maps.TravelMode
      });

      if (!result.routes[0]) {
        throw new Error('No route found');
      }

      const route = result.routes[0].legs[0];
      const path = this.googleMaps.geometry.encoding.decodePath(
        result.routes[0].overview_polyline.points
      );

      return {
        path: path.map(point => ({ lat: point.lat(), lng: point.lng() })),
        distance: route.distance?.value || 0,
        duration: route.duration?.value || 0,
        polyline: result.routes[0].overview_polyline.points
      };
    } catch (error) {
      console.error('Google Maps Directions error:', error);
      throw new Error('Failed to get directions');
    }
  }

  async getTrafficData(bounds: MapBounds): Promise<TrafficData> {
    if (!this.map) throw new Error('Map not initialized');
    
    const response = await this.client.distancematrix.getTrafficData({
      bounds: {
        north: bounds.north,
        south: bounds.south,
        east: bounds.east,
        west: bounds.west
      }
    });

    return {
      timestamp: new Date(),
      congestionLevel: this.getCongestionLevel(response.congestion_value),
      averageSpeed: response.average_speed,
      incidents: response.incidents.map(this.transformIncident),
      segments: response.segments.map(this.transformSegment)
    };
  }

  async getTrafficFlow(location: LatLng, radius: number): Promise<TrafficFlow> {
    if (!this.map) throw new Error('Map not initialized');

    const response = await this.client.roads.getTrafficFlow({
      location: { lat: location.lat, lng: location.lng },
      radius
    });

    return {
      location,
      timestamp: new Date(),
      speed: response.speed,
      density: response.density,
      direction: response.direction,
      confidence: response.confidence,
      history: response.history?.map(h => ({
        timestamp: new Date(h.timestamp),
        speed: h.speed,
        density: h.density
      }))
    };
  }

  async getAlternativeRoutes(
    start: LatLng,
    end: LatLng,
    options?: {
      departureTime?: Date;
      avoidTolls?: boolean;
      avoidHighways?: boolean;
    }
  ): Promise<Array<{
    route: LatLng[];
    duration: number;
    distance: number;
    trafficDensity: number;
  }>> {
    if (!this.map) throw new Error('Map not initialized');

    const response = await this.client.directions.route({
      origin: { lat: start.lat, lng: start.lng },
      destination: { lat: end.lat, lng: end.lng },
      alternatives: true,
      ...options
    });

    return response.routes.map(route => ({
      route: this.decodePolyline(route.overview_polyline.points),
      duration: route.legs[0].duration_in_traffic.value,
      distance: route.legs[0].distance.value,
      trafficDensity: this.calculateTrafficDensity(route)
    }));
  }

  private getCongestionLevel(value: number): 'low' | 'moderate' | 'high' {
    if (value < 0.3) return 'low';
    if (value < 0.7) return 'moderate';
    return 'high';
  }

  private transformIncident(incident: google.maps.TrafficIncident): TrafficIncident {
    return {
      id: incident.id,
      type: this.getIncidentType(incident.type),
      location: {
        lat: incident.location.lat(),
        lng: incident.location.lng()
      },
      description: incident.description,
      severity: this.getSeverityLevel(incident.severity),
      startTime: new Date(incident.startTime),
      endTime: incident.endTime ? new Date(incident.endTime) : undefined,
      impact: {
        radius: incident.impactRadius,
        affectedRoads: incident.affectedRoads || [],
        delay: incident.delay || 0
      }
    };
  }

  private transformSegment(segment: google.maps.TrafficSegment): TrafficSegment {
    return {
      start: {
        lat: segment.start.lat(),
        lng: segment.start.lng()
      },
      end: {
        lat: segment.end.lat(),
        lng: segment.end.lng()
      },
      congestionLevel: this.getCongestionLevel(segment.congestionValue),
      speed: segment.speed,
      duration: segment.duration,
      length: segment.length,
      confidence: segment.confidence
    };
  }

  private calculateTrafficDensity(route: google.maps.DirectionsRoute): number {
    let totalDensity = 0;
    let totalDistance = 0;

    route.legs.forEach(leg => {
      leg.steps.forEach(step => {
        const distance = step.distance.value;
        const durationInTraffic = step.duration_in_traffic?.value || step.duration.value;
        const normalDuration = step.duration.value;
        
        // Calculate density based on the ratio of traffic duration to normal duration
        const density = durationInTraffic / normalDuration;
        totalDensity += density * distance;
        totalDistance += distance;
      });
    });

    return totalDistance > 0 ? totalDensity / totalDistance : 1;
  }

  private getIncidentType(type: number): 'accident' | 'construction' | 'closure' | 'event' {
    const types = {
      1: 'accident',
      2: 'construction',
      3: 'closure',
      4: 'event'
    };
    return types[type as keyof typeof types] || 'event';
  }

  private getSeverityLevel(severity: number): 'low' | 'moderate' | 'high' {
    if (severity <= 3) return 'low';
    if (severity <= 7) return 'moderate';
    return 'high';
  }

  private decodePolyline(encoded: string): LatLng[] {
    const poly = new google.maps.geometry.encoding.decodePath(encoded);
    return poly.map(point => ({
      lat: point.lat(),
      lng: point.lng()
    }));
  }

  public isInitialized(): boolean {
    return this._map !== null;
  }
} 