'use client';

import { useEffect, useRef, useState } from 'react';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { HybridMapService } from '@/services/maps/HybridMapService';
import 'mapbox-gl/dist/mapbox-gl.css';
import * as mapboxgl from 'mapbox-gl';

interface MapViewProps {
  options?: {
    center?: {
      lat: number;
      lng: number;
    };
    zoom?: number;
  };
  showWeather?: boolean;
  showUserLocation?: boolean;
  darkMode?: boolean;
  onMapInit?: (mapService: GoogleMapsManager) => void;
}

export function MapView({
  options = {},
  showWeather = false,
  showUserLocation = false,
  darkMode = false,
  onMapInit
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const hybridService = useRef<HybridMapService | null>(null);
  const { isLoaded } = useGoogleMaps();
  const [mapReady, setMapReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Initialize map
  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      if (!mapRef.current || !isLoaded || hybridService.current) return;

      try {
        // Convert center coordinates to the format Mapbox expects
        const center: [number, number] = [
          options.center?.lng ?? -74.0060,
          options.center?.lat ?? 40.7128
        ];

        // Create and initialize the hybrid service
        const service = new HybridMapService();
        
        // Initialize with explicit typing
        await service.initialize(mapRef.current, {
          center,
          zoom: options.zoom ?? 12,
          darkMode
        });

        // Only update state if component is still mounted
        if (isMounted) {
          hybridService.current = service;
          setMapReady(true);

          if (onMapInit) {
            onMapInit(service.getGoogleManager());
          }
        }
      } catch (error) {
        console.error('Failed to initialize map:', error);
        if (isMounted) {
          setError(error instanceof Error ? error : new Error('Failed to initialize map'));
        }
      }
    };

    // Start initialization
    initMap();

    // Cleanup function
    return () => {
      isMounted = false;
      if (hybridService.current) {
        try {
          const map = hybridService.current.getMap();
          if (map) {
            map.remove();
          }
        } catch (error) {
          console.error('Error cleaning up map:', error);
        }
      }
    };
  }, [isLoaded, options.center?.lat, options.center?.lng, options.zoom, darkMode, onMapInit]);

  // Handle theme changes
  useEffect(() => {
    if (!hybridService.current || !mapReady) return;
    hybridService.current.setTheme(darkMode ? 'dark' : 'light');
  }, [darkMode, mapReady]);

  // Show error state if initialization failed
  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-stone-900 text-white p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Map loading error</h2>
          <p className="text-stone-400 mb-4">{error.message}</p>
          <button
            onClick={() => setError(null)}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-600 rounded-lg transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} className="w-full h-full absolute inset-0" />
    </div>
  );
}