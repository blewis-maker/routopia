import mapboxgl from 'mapbox-gl';
import { GoogleMapsManager } from './GoogleMapsManager';
import { MapboxStyleManager } from './mapbox-custom-styles';
import { Coordinates, MarkerOptions } from '@/types/maps/interfaces';
import { RouteVisualization } from '@/types/route/visualization';

export class HybridMapService {
  private mapbox: mapboxgl.Map | null = null;
  private googleManager: GoogleMapsManager | null = null;
  private styleManager: MapboxStyleManager | null = null;
  private isInitialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;
  private pendingOperations: (() => Promise<void>)[] = [];
  private markers: Map<string, mapboxgl.Marker> = new Map();

  constructor() {
    // Remove the createOverlayContainer from constructor
  }

  async initialize(
    container: HTMLElement,
    options: {
      center: [number, number];
      zoom: number;
      darkMode: boolean;
    }
  ): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = (async () => {
      if (!mapboxgl.accessToken) {
        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
        console.log('Setting Mapbox token:', mapboxgl.accessToken.substring(0, 10) + '...');
      }

      try {
        const initialStyle = 'mapbox://styles/routopia-ai/cm4jwk0xv014s01rcdrkp68lr';
        console.log('Initializing map with style:', initialStyle);

        this.mapbox = new mapboxgl.Map({
          container,
          style: initialStyle,
          center: options.center,
          zoom: options.zoom,
          preserveDrawingBuffer: true,
          antialias: true,
          trackResize: true
        });

        // Wait for both map and style to be fully loaded
        await Promise.all([
          new Promise<void>((resolve, reject) => {
            this.mapbox!.once('load', () => {
              console.log('Map loaded');
              resolve();
            });
            setTimeout(() => reject(new Error('Map load timeout')), 10000);
          }),
          new Promise<void>((resolve, reject) => {
            this.mapbox!.once('style.load', () => {
              console.log('Style loaded');
              resolve();
            });
            setTimeout(() => reject(new Error('Style load timeout')), 10000);
          })
        ]);

        this.isInitialized = true;
        console.log('Map initialization complete');
      } catch (error) {
        this.isInitialized = false;
        this.initializationPromise = null;
        console.error('Failed to initialize map:', error);
        throw error;
      }
    })();

    return this.initializationPromise;
  }

  private getStyleUrl(theme: 'light' | 'dark' | 'satellite'): string {
    const THEME = {
      light: {
        primary: '#2A2B2E',
        secondary: '#494B50',
        accent: '#00B2B2',
        text: '#2A2B2E',
        background: '#F8F9FA',
        roads: '#FFFFFF',
        water: '#BFEFFF',
        landuse: '#E6E8E6',
        buildings: '#FFFFFF'
      },
      dark: {
        primary: '#F8F9FA',
        secondary: '#B4B6BA',
        accent: '#00B2B2',
        text: '#F8F9FA',
        background: '#2A2B2E',
        roads: '#494B50',
        water: '#193C3C',
        landuse: '#363839',
        buildings: '#494B50'
      }
    };

    // Use our custom styles
    switch (theme) {
      case 'light':
        return {
          version: 8,
          name: 'Routopia Light',
          sprite: 'mapbox://sprites/mapbox/light-v11',
          glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
          sources: {
            // ... sources configuration
          },
          layers: [
            // ... layers with THEME.light colors
          ]
        };
      case 'dark':
        return {
          version: 8,
          name: 'Routopia Dark',
          sprite: 'mapbox://sprites/mapbox/dark-v11',
          glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
          sources: {
            // ... sources configuration
          },
          layers: [
            // ... layers with THEME.dark colors
          ]
        };
      case 'satellite':
        return 'mapbox://styles/mapbox/satellite-streets-v12';
      default:
        return 'mapbox://styles/mapbox/dark-v11';
    }
  }

  getGoogleManager(): GoogleMapsManager {
    if (!this.googleManager) {
      throw new Error('Google Maps manager not initialized');
    }
    return this.googleManager;
  }

  // Proxy methods to appropriate service
  drawRoute(route: RouteVisualization) {
    return this.googleManager?.drawRoute(route);
  }

  async addUserLocationMarker(coordinates: { lat: number; lng: number }): Promise<void> {
    console.log('Adding user location marker:', coordinates);
    
    if (!this.isReady()) {
      console.log('Map not ready, waiting for initialization...');
      await new Promise<void>((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 10;
        
        const checkReady = () => {
          if (this.isReady()) {
            this.addUserLocationMarker(coordinates)
              .then(resolve)
              .catch(reject);
          } else if (attempts >= maxAttempts) {
            reject(new Error('Map failed to become ready after maximum attempts'));
          } else {
            attempts++;
            setTimeout(checkReady, 500);
          }
        };
        
        checkReady();
      });
      return;
    }

    try {
      // Remove existing user location marker if it exists
      const existingMarker = this.markers.get('user-location');
      if (existingMarker) {
        existingMarker.remove();
      }

      // Create custom marker element with wrapper div
      const el = document.createElement('div');
      el.className = 'routopia-location-marker';
      el.setAttribute('data-testid', 'location-marker');
      
      // Create SVG wrapper to handle animations properly
      const svgWrapper = document.createElement('div');
      svgWrapper.className = 'marker-icon-wrapper';
      svgWrapper.setAttribute('data-testid', 'marker-wrapper');
      
      // Add debug logging to verify the classes are being applied
      console.log('Creating marker with classes:', {
        markerClass: el.className,
        wrapperClass: svgWrapper.className
      });
      
      svgWrapper.innerHTML = `
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="32" 
          height="32" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2" 
          stroke-linecap="round" 
          stroke-linejoin="round"
          class="marker-icon"
          data-testid="marker-svg"
        >
          <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      `;
      
      el.appendChild(svgWrapper);

      // Create and add the new marker
      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'bottom',
        offset: [0, 0] // Adjust if needed based on your icon
      })
        .setLngLat([coordinates.lng, coordinates.lat])
        .addTo(this.mapbox!);

      // Store the marker reference
      this.markers.set('user-location', marker);

      console.log('User location marker added successfully');
    } catch (error) {
      console.error('Error adding user location marker:', error);
      throw error;
    }
  }

  // Add method to remove markers
  removeMarker(markerId: string): void {
    const marker = this.markers.get(markerId);
    if (marker) {
      marker.remove();
      this.markers.delete(markerId);
    }
  }

  // Add method to clear all markers
  clearMarkers(): void {
    this.markers.forEach(marker => marker.remove());
    this.markers.clear();
  }

  async addMarker(coordinates: Coordinates, options?: MarkerOptions): Promise<string> {
    if (!this.isReady()) {
      throw new Error('Map not fully initialized');
    }

    try {
      const markerId = `marker-${Date.now()}`;
      const marker = new mapboxgl.Marker({
        color: options?.type === 'start' ? '#00B2B2' : '#FF0000',
        draggable: options?.draggable
      })
        .setLngLat([coordinates.lng, coordinates.lat]);

      if (this.mapbox!.loaded()) {
        marker.addTo(this.mapbox!);
      } else {
        this.mapbox!.once('load', () => marker.addTo(this.mapbox!));
      }

      return markerId;
    } catch (error) {
      console.error('Error adding marker:', error);
      throw error;
    }
  }

  isReady(): boolean {
    console.log('Checking map ready state:', {
      hasMapbox: !!this.mapbox,
      isInitialized: this.isInitialized,
      isLoaded: this.mapbox?.loaded(),
      hasGoogleManager: !!this.googleManager
    });
    
    return this.isInitialized && !!this.mapbox && this.mapbox.loaded();
  }

  async setTheme(theme: 'light' | 'dark' | 'satellite'): Promise<void> {
    if (!this.isReady()) {
      console.error('Map not fully initialized');
      return;
    }

    try {
      // Wait for any pending operations
      await new Promise<void>(resolve => {
        if (this.mapbox!.isStyleLoaded()) {
          resolve();
        } else {
          this.mapbox!.once('styledata', () => resolve());
        }
      });

      // Store current state
      const center = this.mapbox!.getCenter();
      const zoom = this.mapbox!.getZoom();
      const bearing = this.mapbox!.getBearing();
      const pitch = this.mapbox!.getPitch();

      // Change style and wait for it to load
      await new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => reject(new Error('Style change timeout')), 10000);

        this.mapbox!.once('style.load', () => {
          clearTimeout(timeoutId);
          try {
            // Restore state
            this.mapbox!.setCenter(center);
            this.mapbox!.setZoom(zoom);
            this.mapbox!.setBearing(bearing);
            this.mapbox!.setPitch(pitch);

            // Redraw overlays
            if (this.googleManager) {
              this.googleManager.redrawOverlays();
            }

            resolve();
          } catch (error) {
            reject(error);
          }
        });

        this.mapbox!.once('error', (e) => {
          clearTimeout(timeoutId);
          reject(e.error);
        });

        this.mapbox!.setStyle(this.getStyleUrl(theme), { diff: false });
      });
    } catch (error) {
      console.error('Error setting theme:', error);
      throw error;
    }
  }

  getMap(): mapboxgl.Map | null {
    return this.mapbox;
  }

  cleanup(): void {
    if (this.mapbox) {
      this.mapbox.remove();
      this.mapbox = null;
    }

    this.styleManager = null;
    this.googleManager = null;
    this.isInitialized = false;
  }

  setCenter(center: [number, number]) {
    if (!this.mapbox) return;
    this.mapbox.setCenter(center);
  }

  setZoom(zoom: number) {
    if (!this.mapbox) return;
    this.mapbox.setZoom(zoom);
  }

  fitBounds(bounds: mapboxgl.LngLatBoundsLike, options?: mapboxgl.FitBoundsOptions) {
    if (!this.mapbox) return;
    this.mapbox.fitBounds(bounds, options);
  }

  async setMapboxStyle(styleUrl: string) {
    if (!this.mapbox || !this.isInitialized) {
      throw new Error('Map not initialized');
    }

    try {
      console.log('Starting style change to:', styleUrl);
      
      // Store current state
      const center = this.mapbox.getCenter();
      const zoom = this.mapbox.getZoom();
      const bearing = this.mapbox.getBearing();
      const pitch = this.mapbox.getPitch();

      // Set the style and wait for it to load
      await new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Style change timeout after 10s'));
        }, 10000);

        const handleStyleLoad = () => {
          clearTimeout(timeoutId);
          console.log('New style loaded, restoring map state');
          
          try {
            // Restore state
            this.mapbox!.setCenter(center);
            this.mapbox!.setZoom(zoom);
            this.mapbox!.setBearing(bearing);
            this.mapbox!.setPitch(pitch);

            if (this.googleManager) {
              this.googleManager.redrawOverlays();
            }

            resolve();
          } catch (error) {
            reject(error);
          }
        };

        // Set up style load handler
        this.mapbox!.once('style.load', handleStyleLoad);

        // Apply the new style
        console.log('Applying new style...');
        this.mapbox!.setStyle(styleUrl);
      });

      console.log('Style change completed successfully');
    } catch (error) {
      console.error('Error in setMapboxStyle:', error);
      throw error;
    }
  }

  private getCustomStyle(styleId: string): mapboxgl.Style {
    const THEME = {
      light: {
        primary: '#2A2B2E',
        secondary: '#494B50',
        accent: '#00B2B2',
        text: '#2A2B2E',
        background: '#F8F9FA',
        roads: '#FFFFFF',
        water: '#BFEFFF',
        landuse: '#E6E8E6',
        buildings: '#FFFFFF'
      },
      dark: {
        primary: '#F8F9FA',
        secondary: '#B4B6BA',
        accent: '#00B2B2',
        text: '#F8F9FA',
        background: '#2A2B2E',
        roads: '#494B50',
        water: '#193C3C',
        landuse: '#363839',
        buildings: '#494B50'
      }
    };

    // Return the appropriate custom style based on styleId
    switch (styleId) {
      case 'routopia-light':
        return {
          version: 8,
          name: 'Routopia Light',
          sprite: 'mapbox://sprites/mapbox/light-v11',
          glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
          sources: {
            // Add your sources here
          },
          layers: [
            // Add your layers here with THEME.light colors
          ]
        } as mapboxgl.Style;

      case 'routopia-dark':
        return {
          version: 8,
          name: 'Routopia Dark',
          sprite: 'mapbox://sprites/mapbox/dark-v11',
          glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
          sources: {
            // Add your sources here
          },
          layers: [
            // Add your layers here with THEME.dark colors
          ]
        } as mapboxgl.Style;

      default:
        throw new Error(`Unknown custom style: ${styleId}`);
    }
  }

  async setMapStyle(styleId: string): Promise<void> {
    console.log('HybridMapService.setMapStyle called with:', styleId);
    console.log('Map state:', {
      isInitialized: this.isInitialized,
      hasMapbox: !!this.mapbox,
      mapboxMethods: this.mapbox ? Object.keys(this.mapbox) : []
    });
    
    if (!this.mapbox || !this.isInitialized) {
      throw new Error('Map not initialized');
    }

    const styleUrls: Record<string, string> = {
      light: 'mapbox://styles/routopia-ai/cm4jx654z000001sy5zpghbfc',
      dark: 'mapbox://styles/routopia-ai/cm4jwk0xv014s01rcdrkp68lr',
      satellite: 'mapbox://styles/routopia-ai/cm4jx97ex00hx01rahmsp9rqu'
    };

    console.log('Style configuration:', {
      requestedStyleId: styleId,
      availableStyles: Object.keys(styleUrls),
      matchingStyle: styleUrls[styleId]
    });

    const styleUrl = styleUrls[styleId];

    if (!styleUrl) {
      throw new Error(`Invalid style ID: ${styleId}`);
    }

    try {
      console.log('Starting style change to:', styleUrl);
      
      // Store current state
      const center = this.mapbox.getCenter();
      const zoom = this.mapbox.getZoom();
      const bearing = this.mapbox.getBearing();
      const pitch = this.mapbox.getPitch();

      // Set the style and wait for it to load
      await new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Style change timeout after 10s'));
        }, 10000);

        const handleStyleLoad = () => {
          clearTimeout(timeoutId);
          console.log('New style loaded, restoring map state');
          
          try {
            // Restore state
            this.mapbox!.setCenter(center);
            this.mapbox!.setZoom(zoom);
            this.mapbox!.setBearing(bearing);
            this.mapbox!.setPitch(pitch);

            if (this.googleManager) {
              this.googleManager.redrawOverlays();
            }

            resolve();
          } catch (error) {
            console.error('Error restoring map state:', error);
            reject(error);
          }
        };

        // Set up style load handler
        this.mapbox!.once('style.load', handleStyleLoad);

        // Apply the new style
        console.log('Applying new style...');
        this.mapbox!.setStyle(styleUrl);
      });

      console.log('Style change completed successfully');
    } catch (error) {
      console.error('Error in setMapStyle:', error);
      throw error;
    }
  }

  async calculateRoute(params: {
    origin: Location;
    destination: Location;
    waypoints?: Location[];
  }) {
    if (!this.isReady()) {
      throw new Error('Map not initialized');
    }

    try {
      // Use Google's DirectionsService for stable routing
      const directionsService = new google.maps.DirectionsService();
      
      const request = {
        origin: { lat: params.origin.lat, lng: params.origin.lng },
        destination: { lat: params.destination.lat, lng: params.destination.lng },
        waypoints: params.waypoints?.map(point => ({
          location: { lat: point.lat, lng: point.lng },
          stopover: true
        })) || [],
        travelMode: google.maps.TravelMode.DRIVING
      };

      const result = await directionsService.route(request);
      return this.processRouteResult(result);
    } catch (error) {
      console.error('Route calculation failed:', error);
      throw error;
    }
  }

  private processRouteResult(result: google.maps.DirectionsResult) {
    // Extract route data in a format we can use
    const route = result.routes[0];
    return {
      path: route.overview_path.map(point => ({
        lat: point.lat(),
        lng: point.lng()
      })),
      distance: route.legs.reduce((total, leg) => total + leg.distance.value, 0),
      duration: route.legs.reduce((total, leg) => total + leg.duration.value, 0),
      bounds: route.bounds,
    };
  }

  async updateRouteVisualization(routeData: any) {
    if (!this.mapbox || !routeData.path) return;

    // Remove existing layers
    this.cleanupRouteLayers();

    // Add the route source with initial empty state
    this.mapbox.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: []
        }
      }
    });

    // Add base route layer
    this.addRouteLayers();

    // Animate the route drawing
    await this.animateRoute(routeData.path);

    // Fit bounds with smooth transition
    this.fitRouteBounds(routeData.bounds);
  }

  private cleanupRouteLayers() {
    if (!this.mapbox) return;
    
    ['route', 'route-glow', 'route-casing'].forEach(layerId => {
      if (this.mapbox.getLayer(layerId)) {
        this.mapbox.removeLayer(layerId);
      }
    });
    
    if (this.mapbox.getSource('route')) {
      this.mapbox.removeSource('route');
    }
  }

  private addRouteLayers() {
    if (!this.mapbox) return;

    // Add casing layer for depth effect
    this.mapbox.addLayer({
      id: 'route-casing',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#002626',
        'line-width': ['interpolate', ['linear'], ['zoom'],
          10, 5,
          15, 8
        ],
        'line-opacity': 0.5
      }
    });

    // Main route layer
    this.mapbox.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#00B2B2',
        'line-width': ['interpolate', ['linear'], ['zoom'],
          10, 3,
          15, 6
        ],
        'line-opacity': 0.8
      }
    });

    // Glow effect
    this.mapbox.addLayer({
      id: 'route-glow',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#00B2B2',
        'line-width': ['interpolate', ['linear'], ['zoom'],
          10, 6,
          15, 12
        ],
        'line-opacity': 0.2,
        'line-blur': 3
      }
    });
  }

  private async animateRoute(path: Array<{lat: number, lng: number}>) {
    if (!this.mapbox) return;

    const points = path.map(p => [p.lng, p.lat]);
    const steps = 50;
    const duration = 1000;
    const stepDuration = duration / steps;

    for (let i = 1; i <= steps; i++) {
      const progress = i / steps;
      const currentPoints = points.slice(0, Math.floor(points.length * progress));

      this.mapbox.getSource('route').setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: currentPoints
        }
      });

      await new Promise(resolve => setTimeout(resolve, stepDuration));
    }
  }

  // ... add other necessary methods
} 