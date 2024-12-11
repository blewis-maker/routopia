import mapboxgl from 'mapbox-gl';
import { GoogleMapsManager } from './GoogleMapsManager';
import { MapboxStyleManager } from './mapbox-custom-styles';
import { Coordinates, MarkerOptions } from './MapServiceInterface';
import { RouteVisualization } from '@/types/route/visualization';

export class HybridMapService {
  private mapbox: mapboxgl.Map | null = null;
  private googleManager: GoogleMapsManager | null = null;
  private styleManager: MapboxStyleManager | null = null;
  private overlayContainer: HTMLDivElement | null = null;

  constructor() {
    this.createOverlayContainer();
  }

  private validateMapboxToken(token: string): boolean {
    return token.startsWith('pk.') && token.length > 50;
  }

  async initialize(container: HTMLElement, options: {
    center: [number, number];
    zoom: number;
    darkMode: boolean;
  }) {
    // Set access token before any map operations
    if (!mapboxgl.accessToken) {
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
    }

    // Ensure container is ready
    await new Promise<void>(resolve => {
      if (document.readyState === 'complete') {
        resolve();
      } else {
        window.addEventListener('load', () => resolve(), { once: true });
      }
    });

    try {
      // Initialize map with explicit coordinates
      this.mapbox = new mapboxgl.Map({
        container,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [
          Number(options.center[0]) || -74.0060,
          Number(options.center[1]) || 40.7128
        ],
        zoom: Number(options.zoom) || 12,
        preserveDrawingBuffer: true,
        antialias: true,
        trackResize: true,
        attributionControl: false, // We'll add this manually if needed
        failIfMajorPerformanceCaveat: false // More forgiving performance requirements
      });

      // Wait for map to be fully loaded
      await new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Map initialization timeout'));
        }, 10000); // 10 second timeout

        this.mapbox!.once('load', () => {
          clearTimeout(timeoutId);
          try {
            // Initialize managers
            this.styleManager = new MapboxStyleManager(this.mapbox!);
            this.googleManager = new GoogleMapsManager();
            this.googleManager.setMapInstance(this.mapbox!);

            // Add overlay container
            if (this.overlayContainer) {
              container.appendChild(this.overlayContainer);
            }

            // Set initial theme
            this.styleManager.setTheme(options.darkMode ? 'dark' : 'light');

            resolve();
          } catch (error) {
            reject(error);
          }
        });

        this.mapbox!.once('error', (e) => {
          clearTimeout(timeoutId);
          reject(e.error);
        });
      });

      // Add error handling for runtime errors
      this.mapbox.on('error', (e) => {
        console.error('Mapbox runtime error:', e.error);
      });

      return this;
    } catch (error) {
      console.error('Failed to initialize map:', error);
      // Clean up if initialization fails
      if (this.mapbox) {
        this.mapbox.remove();
        this.mapbox = null;
      }
      throw error;
    }
  }

  getGoogleManager(): GoogleMapsManager {
    if (!this.googleManager) {
      throw new Error('Google Maps manager not initialized');
    }
    return this.googleManager;
  }

  private createOverlayContainer() {
    if (typeof window === 'undefined') return;
    
    this.overlayContainer = document.createElement('div');
    this.overlayContainer.className = 'google-maps-overlays';
    this.overlayContainer.style.position = 'absolute';
    this.overlayContainer.style.top = '0';
    this.overlayContainer.style.left = '0';
    this.overlayContainer.style.width = '100%';
    this.overlayContainer.style.height = '100%';
    this.overlayContainer.style.pointerEvents = 'none';
  }

  // Proxy methods to appropriate service
  drawRoute(route: RouteVisualization) {
    return this.googleManager?.drawRoute(route);
  }

  addMarker(coordinates: Coordinates, options?: MarkerOptions) {
    return this.googleManager?.addMarker(coordinates, options);
  }

  setTheme(theme: 'light' | 'dark' | 'satellite') {
    this.styleManager?.setTheme(theme);
  }

  getMap(): mapboxgl.Map | null {
    return this.mapbox;
  }

  // ... add other necessary methods
} 