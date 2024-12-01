import mapboxgl from 'mapbox-gl';
import { MapServiceInterface, RouteVisualization, RouteOptions } from './MapServiceInterface';
import { GoogleMapsManager } from './GoogleMapsManager';
import { getActivityStyle, getAlternativeRouteStyle, getTrafficStyle } from '@/lib/utils/mapStyles';
import { RouteVisualizationData, ActivityType } from '@/types/maps';
import { RouteCache } from '@/services/cache/RouteCache';
import { TrafficCache } from '@/services/cache/TrafficCache';
import { MapTileCache } from '@/services/cache/MapTileCache';
import { CacheAnalytics } from '@/services/cache/CacheAnalytics';
import { PerformanceMetrics } from '@/services/monitoring/PerformanceMetrics';

export class MapboxManager implements MapServiceInterface {
  private map: mapboxgl.Map | null = null;
  private googleServices: GoogleMapsManager;
  private routeCache: RouteCache;
  private trafficCache: TrafficCache;
  private tileCache: MapTileCache;
  private cacheAnalytics: CacheAnalytics;
  private performanceMetrics: PerformanceMetrics;

  constructor() {
    if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
      throw new Error('Mapbox token not configured');
    }
    
    // Initialize services and caches
    this.googleServices = new GoogleMapsManager();
    this.routeCache = new RouteCache();
    this.trafficCache = new TrafficCache();
    this.tileCache = new MapTileCache();
    this.cacheAnalytics = new CacheAnalytics();
    this.performanceMetrics = new PerformanceMetrics();
    this.setupPerformanceMonitoring();

    // Set up tile request interceptor
    this.setupTileInterceptor();
  }

  private setupTileInterceptor(): void {
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo, init?: RequestInit) => {
      const url = input.toString();
      if (url.includes('mapbox.com/tiles')) {
        const key = this.extractTileKey(url);
        const cachedTile = this.tileCache.get(key);
        
        if (cachedTile) {
          this.cacheAnalytics.recordHit('tile');
          return new Response(cachedTile);
        }

        this.cacheAnalytics.recordMiss('tile');
        const response = await originalFetch(input, init);
        const buffer = await response.clone().arrayBuffer();
        await this.tileCache.set(key, buffer);
        
        return response;
      }
      return originalFetch(input, init);
    };
  }

  async initialize(containerId: string, options?: any): Promise<void> {
    // Initialize Mapbox for map rendering
    this.map = new mapboxgl.Map({
      container: containerId,
      style: 'mapbox://styles/mapbox/dark-v11',
      accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
      ...options
    });

    // Initialize Google services in background
    await this.googleServices.initialize('google-services-container');
  }

  // Delegate service methods to Google while keeping map rendering on Mapbox
  async drawRoute(
    route: RouteVisualization,
    options: RouteOptions
  ): Promise<void> {
    // Get route data from Google
    const googleRoute = await this.googleServices.getRouteData(route, options);
    
    // Render on Mapbox map
    this.renderRouteOnMap(googleRoute, options);
  }

  async setTrafficLayer(visible: boolean, options?: any): Promise<void> {
    // Get traffic data from Google
    const trafficData = await this.googleServices.getTrafficData();
    
    // Render on Mapbox map
    this.renderTrafficOnMap(trafficData, visible, options);
  }

  async visualizeRoute(
    start: Coordinates,
    end: Coordinates,
    waypoints: Coordinates[] = [],
    activityType: ActivityType
  ): Promise<void> {
    const startTime = performance.now();
    try {
      // Check route cache
      const routeCacheKey = this.routeCache.generateKey(start, end, activityType);
      let routeData = this.routeCache.get(routeCacheKey);

      if (routeData) {
        this.cacheAnalytics.recordHit('route');
      } else {
        this.cacheAnalytics.recordMiss('route');
        routeData = await this.googleServices.getRouteData(
          start,
          end,
          waypoints,
          activityType
        );
        this.routeCache.set(routeCacheKey, routeData);
      }

      // Check traffic cache
      const trafficCacheKey = this.trafficCache.generateKey(routeData.path);
      let trafficData = this.trafficCache.get(trafficCacheKey);

      if (trafficData) {
        this.cacheAnalytics.recordHit('traffic');
        routeData.traffic.segments = trafficData;
      } else {
        this.cacheAnalytics.recordMiss('traffic');
        trafficData = await this.googleServices.getTrafficForRoute(routeData.path);
        this.trafficCache.set(trafficCacheKey, trafficData);
      }

      // Visualize on map
      await this.renderRouteVisualization(routeData, activityType);

      this.performanceMetrics.record('route.loadTime', performance.now() - startTime, {
        start,
        end,
        activityType
      });
    } catch (error) {
      this.performanceMetrics.record('api.errorRate', 1);
      throw error;
    }
  }

  private extractTileKey(url: string): string {
    const match = url.match(/\/(\d+)\/(\d+)\/(\d+)/);
    if (!match) throw new Error('Invalid tile URL');
    return this.tileCache.generateKey(
      parseInt(match[1]),
      parseInt(match[2]),
      parseInt(match[3])
    );
  }

  private async renderRouteVisualization(
    data: RouteVisualizationData,
    activityType: ActivityType
  ): Promise<void> {
    if (!this.map) return;

    // Clear existing layers
    this.clearRouteLayers();

    // Add main route
    const routeSource = {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: data.path
        }
      }
    };

    this.map.addSource('route', routeSource);
    this.map.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      paint: {
        ...getActivityStyle(activityType),
        'line-width': ['interpolate', ['linear'], ['zoom'], 12, 3, 16, 6]
      }
    });

    // Add traffic visualization if available
    if (data.traffic) {
      this.renderTrafficData(data.traffic);
    }

    // Add alternative routes if available
    if (data.alternatives) {
      this.renderAlternativeRoutes(data.alternatives);
    }

    // Fit bounds to show entire route
    this.fitRouteBounds(data);
  }

  private renderTrafficData(trafficData: RouteVisualizationData['traffic']): void {
    if (!this.map || !trafficData) return;

    // Add traffic segments
    const segmentsSource = {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: trafficData.segments.map(segment => ({
          type: 'Feature',
          properties: { congestion: segment.congestion },
          geometry: {
            type: 'LineString',
            coordinates: [segment.start, segment.end]
          }
        }))
      }
    };

    this.map.addSource('traffic', segmentsSource);
    this.map.addLayer({
      id: 'traffic',
      type: 'line',
      source: 'traffic',
      paint: {
        'line-color': [
          'match',
          ['get', 'congestion'],
          'low', getTrafficStyle('low').color!,
          'moderate', getTrafficStyle('moderate').color!,
          'heavy', getTrafficStyle('heavy').color!,
          getTrafficStyle('low').color!
        ],
        'line-width': 4,
        'line-opacity': 0.8
      }
    });
  }

  // ... other methods following the same pattern ...

  private async renderRouteOnMap(googleRoute: any, options: RouteOptions): Promise<void> {
    if (!this.map) return;

    // Clear existing routes
    this.clearExistingRoutes();

    // Create GeoJSON for the route
    const routeGeoJSON = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: googleRoute.routes[0].overview_path.map((point: any) => [
          point.lng(),
          point.lat()
        ])
      }
    };

    // Add route source
    this.map.addSource('route', {
      type: 'geojson',
      data: routeGeoJSON
    });

    // Add route layer with activity-specific styling
    this.map.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': this.getActivityColor(options.activityType),
        'line-width': options.style?.width || 5,
        'line-opacity': options.style?.opacity || 1,
        'line-dasharray': options.activityType === 'bike' ? [2, 1] : [1]
      }
    });

    // Add traffic visualization if enabled
    if (options.showTraffic) {
      await this.renderTrafficData(googleRoute.trafficData);
    }

    // Add alternative routes if available
    if (options.showAlternatives && googleRoute.alternatives) {
      this.renderAlternativeRoutes(googleRoute.alternatives);
    }
  }

  private renderTrafficData(trafficData: TrafficData): void {
    if (!this.map) return;

    // Add traffic congestion layer
    this.map.addLayer({
      id: 'traffic',
      type: 'line',
      source: 'route',
      paint: {
        'line-color': [
          'match',
          ['get', 'congestion'],
          'low', '#4CAF50',
          'moderate', '#FFC107',
          'heavy', '#F44336',
          '#4CAF50'
        ],
        'line-width': 3,
        'line-opacity': 0.8
      }
    });

    // Add traffic incidents if any
    if (trafficData.incidents?.length) {
      this.renderTrafficIncidents(trafficData.incidents);
    }
  }

  private renderAlternativeRoutes(alternatives: any[]): void {
    if (!this.map) return;

    alternatives.forEach((route, index) => {
      const sourceId = `alternative-${index}`;
      const layerId = `alternative-route-${index}`;

      // Add alternative route source
      this.map.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: route.overview_path.map((point: any) => [
              point.lng(),
              point.lat()
            ])
          }
        }
      });

      // Add alternative route layer
      this.map.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': '#666',
          'line-width': 3,
          'line-opacity': 0.5,
          'line-dasharray': [2, 2]
        }
      });
    });
  }

  private getActivityColor(type: string): string {
    switch (type) {
      case 'bike':
        return '#4CAF50';
      case 'ski':
        return '#2196F3';
      default:
        return '#3F51B5';
    }
  }

  private clearExistingRoutes(): void {
    if (!this.map) return;

    // Remove existing layers and sources
    ['route', 'traffic'].forEach(id => {
      if (this.map?.getLayer(id)) {
        this.map.removeLayer(id);
      }
      if (this.map?.getSource(id)) {
        this.map.removeSource(id);
      }
    });

    // Remove alternative routes
    this.map.getStyle().layers
      .filter(layer => layer.id.startsWith('alternative-route-'))
      .forEach(layer => {
        this.map?.removeLayer(layer.id);
        this.map?.removeSource(layer.id.replace('route-', ''));
      });
  }

  private renderTrafficIncidents(incidents: RouteVisualizationData['traffic']['incidents']): void {
    if (!this.map || !incidents) return;

    // Add incidents source
    this.map.addSource('incidents', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: incidents.map(incident => ({
          type: 'Feature',
          properties: {
            type: incident.type,
            severity: incident.severity,
            description: incident.description
          },
          geometry: {
            type: 'Point',
            coordinates: incident.location
          }
        }))
      }
    });

    // Add incidents symbol layer
    this.map.addLayer({
      id: 'incidents-markers',
      type: 'symbol',
      source: 'incidents',
      layout: {
        'icon-image': 'warning',
        'icon-size': 1.2,
        'icon-allow-overlap': true,
        'text-field': ['get', 'description'],
        'text-offset': [0, 1.5],
        'text-anchor': 'top'
      },
      paint: {
        'text-color': '#ffffff',
        'text-halo-color': '#000000',
        'text-halo-width': 1
      }
    });
  }

  private addInteractiveWaypoints(waypoints: RouteVisualizationData['waypoints']): void {
    if (!this.map || !waypoints) return;

    // Add markers container
    const markersContainer = document.createElement('div');
    markersContainer.className = 'markers-container';

    // Add start marker
    const startMarker = new mapboxgl.Marker({
      element: this.createWaypointElement('start'),
      draggable: true
    })
      .setLngLat(waypoints.start)
      .addTo(this.map);

    // Add end marker
    const endMarker = new mapboxgl.Marker({
      element: this.createWaypointElement('end'),
      draggable: true
    })
      .setLngLat(waypoints.end)
      .addTo(this.map);

    // Add via waypoints
    waypoints.via.forEach((point, index) => {
      const marker = new mapboxgl.Marker({
        element: this.createWaypointElement('waypoint'),
        draggable: true
      })
        .setLngLat(point)
        .addTo(this.map);

      // Add drag end listener
      marker.on('dragend', () => {
        const lngLat = marker.getLngLat();
        this.onWaypointDrag?.(index, { lat: lngLat.lat, lng: lngLat.lng });
      });
    });
  }

  private createWaypointElement(type: 'start' | 'end' | 'waypoint'): HTMLElement {
    const element = document.createElement('div');
    element.className = `waypoint-marker waypoint-${type}`;
    
    // Add icon based on type
    const icon = document.createElement('img');
    icon.src = `/assets/icons/marker-${type}.svg`;
    icon.alt = `${type} marker`;
    element.appendChild(icon);

    return element;
  }

  private fitRouteBounds(data: RouteVisualizationData): void {
    if (!this.map || !data.path.length) return;

    const bounds = new mapboxgl.LngLatBounds();

    // Add main route points to bounds
    data.path.forEach(coord => bounds.extend(coord));

    // Add waypoints to bounds if they exist
    if (data.waypoints) {
      bounds.extend(data.waypoints.start);
      bounds.extend(data.waypoints.end);
      data.waypoints.via.forEach(point => bounds.extend(point));
    }

    // Add incidents to bounds if they exist
    data.traffic?.incidents?.forEach(incident => bounds.extend(incident.location));

    // Fit the map to the bounds with padding
    this.map.fitBounds(bounds, {
      padding: 50,
      duration: 1000,
      maxZoom: 15
    });
  }

  private renderTrafficOnMap(trafficData: any, visible: boolean, options?: any): void {
    if (!this.map || !visible) {
      this.clearTrafficLayers();
      return;
    }

    // Add traffic flow layer
    if (options?.showRealTime) {
      this.map.addLayer({
        id: 'traffic-flow',
        type: 'line',
        source: {
          type: 'geojson',
          data: trafficData.flow
        },
        paint: {
          'line-color': [
            'match',
            ['get', 'congestion'],
            'low', getTrafficStyle('low').color!,
            'moderate', getTrafficStyle('moderate').color!,
            'heavy', getTrafficStyle('heavy').color!,
            getTrafficStyle('low').color!
          ],
          'line-width': 3,
          'line-opacity': 0.7
        }
      });
    }

    // Add incidents if enabled
    if (options?.showIncidents && trafficData.incidents) {
      this.renderTrafficIncidents(trafficData.incidents);
    }
  }

  private clearTrafficLayers(): void {
    if (!this.map) return;

    ['traffic-flow', 'incidents-markers'].forEach(layerId => {
      if (this.map?.getLayer(layerId)) {
        this.map.removeLayer(layerId);
      }
      if (this.map?.getSource(layerId)) {
        this.map.removeSource(layerId);
      }
    });
  }

  private setupPerformanceMonitoring(): void {
    if (this.map) {
      // Monitor FPS
      let lastFrame = performance.now();
      this.map.on('render', () => {
        const now = performance.now();
        const fps = 1000 / (now - lastFrame);
        this.performanceMetrics.record('map.fps', fps);
        lastFrame = now;
      });

      // Monitor tile loading
      this.map.on('data', (e) => {
        if (e.dataType === 'source' && e.tile) {
          this.performanceMetrics.record('map.tileLoadTime', e.timeStamp);
        }
      });
    }
  }
} 