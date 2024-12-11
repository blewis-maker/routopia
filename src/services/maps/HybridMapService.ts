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
  private pendingOperations: (() => Promise<void>)[] = [];

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
    if (!mapboxgl.accessToken) {
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
    }

    try {
      // Use direct Mapbox style URL
      const initialStyle = options.darkMode 
        ? 'mapbox://styles/mapbox/dark-v11'
        : 'mapbox://styles/mapbox/light-v11';
      
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
        new Promise<void>((resolve) => this.mapbox!.once('load', () => resolve())),
        new Promise<void>((resolve) => this.mapbox!.once('style.load', () => resolve()))
      ]);

      this.styleManager = new MapboxStyleManager(this.mapbox);
      this.googleManager = new GoogleMapsManager();
      this.googleManager.setMapInstance(this.mapbox);
      
      this.isInitialized = true;

      // Execute any pending operations
      while (this.pendingOperations.length > 0) {
        const operation = this.pendingOperations.shift();
        if (operation) {
          await operation();
        }
      }
    } catch (error) {
      console.error('Failed to initialize map:', error);
      throw error;
    }
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

  async addUserLocationMarker(coordinates: Coordinates): Promise<void> {
    if (!this.isReady()) {
      // Queue the operation instead of failing
      return new Promise((resolve, reject) => {
        this.pendingOperations.push(async () => {
          try {
            await this.addUserLocationMarker(coordinates);
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      });
    }

    try {
      await this.addMarker(coordinates, {
        type: 'start',
        draggable: false
      });
    } catch (error) {
      console.error('Error adding user location marker:', error);
      throw error;
    }
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
    return !!(
      this.mapbox && 
      this.isInitialized && 
      this.mapbox.loaded() && 
      this.mapbox.isStyleLoaded() &&
      this.styleManager &&
      this.googleManager
    );
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

  async setMapboxStyle(styleId: string) {
    if (!this.mapbox || !this.isReady()) {
      throw new Error('Map not initialized');
    }

    try {
      // Store current state
      const center = this.mapbox.getCenter();
      const zoom = this.mapbox.getZoom();
      const bearing = this.mapbox.getBearing();
      const pitch = this.mapbox.getPitch();

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

            if (this.googleManager) {
              this.googleManager.redrawOverlays();
            }

            resolve();
          } catch (error) {
            reject(error);
          }
        });

        // Set the style directly using the Mapbox style URL
        this.mapbox!.setStyle(styleId);
      });
    } catch (error) {
      console.error('Error setting Mapbox style:', error);
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

  // ... add other necessary methods
} 