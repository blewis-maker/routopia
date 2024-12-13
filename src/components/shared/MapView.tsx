'use client';

import { useEffect, useRef, useState } from 'react';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { HybridMapService } from '@/services/maps/HybridMapService';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapViewProps {
  options: {
    center: LatLng;
    zoom: number;
  };
  showWeather?: boolean;
  showUserLocation?: boolean;
  darkMode?: boolean;
  onMapInit: (service: HybridMapService) => void;
}

export function MapView({
  options = {},
  showWeather = false,
  showUserLocation = false,
  darkMode = false,
  onMapInit
}: MapViewProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const serviceRef = useRef<HybridMapService | null>(null);
  const { isLoaded } = useGoogleMaps();
  const [error, setError] = useState<Error | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!wrapperRef.current || !isLoaded || serviceRef.current) return;

    // Create a clean container for the map
    const mapContainer = document.createElement('div');
    mapContainer.style.position = 'absolute';
    mapContainer.style.width = '100%';
    mapContainer.style.height = '100%';
    mapContainer.style.opacity = '0';
    mapContainer.style.transition = 'opacity 0.8s ease-in-out';
    wrapperRef.current.appendChild(mapContainer);

    const initMap = async () => {
      try {
        const center: [number, number] = [
          options.center?.lng ?? -105.0749801,
          options.center?.lat ?? 40.5852602
        ];

        const service = new HybridMapService();
        
        await service.initialize(mapContainer, {
          center,
          zoom: options.zoom ?? 12,
          darkMode
        });

        // Wait for both map and style to be loaded
        await new Promise<void>((resolve) => {
          const checkReady = () => {
            if (service.isReady()) {
              resolve();
            } else {
              setTimeout(checkReady, 100);
            }
          };
          checkReady();
        });

        serviceRef.current = service;
        setTimeout(() => {
          mapContainer.style.opacity = '1';
        }, 500);
        setIsMapReady(true);
        
        if (onMapInit) {
          onMapInit(service);
        }
      } catch (error) {
        console.error('Failed to initialize map:', error);
        setError(error instanceof Error ? error : new Error('Failed to initialize map'));
      }
    };

    initMap();

    return () => {
      if (serviceRef.current) {
        serviceRef.current.cleanup();
        serviceRef.current = null;
      }
      if (wrapperRef.current && mapContainer.parentNode === wrapperRef.current) {
        wrapperRef.current.removeChild(mapContainer);
      }
    };
  }, [isLoaded, options.center?.lat, options.center?.lng, options.zoom, onMapInit]);

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
      <div ref={wrapperRef} className="absolute inset-0" />
      
      {isMapReady && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {/* UI elements go here */}
        </div>
      )}
    </div>
  );
}