'use client';

import { useEffect, useRef, useState } from 'react';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { GoogleMapsManager } from '@/services/maps/GoogleMapsManager';

interface MapViewProps {
  options?: google.maps.MapOptions;
  showWeather?: boolean;
  showUserLocation?: boolean;
  darkMode?: boolean;
  onMapInit?: (mapService: GoogleMapsManager) => void;
}

const darkMapStyle = [
  {
    featureType: 'all',
    elementType: 'geometry',
    stylers: [{ color: '#242f3e' }]
  },
  // ... rest of dark styles
] as google.maps.MapTypeStyle[];

const lightMapStyle = [
  {
    featureType: 'all',
    elementType: 'geometry',
    stylers: [{ color: '#f5f5f5' }]
  },
  // ... rest of light styles
] as google.maps.MapTypeStyle[];

export function MapView({
  options = {},
  showWeather = false,
  showUserLocation = false,
  darkMode = false,
  onMapInit
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const { isLoaded } = useGoogleMaps();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || isInitialized) return;

    try {
      const mapInstance = new google.maps.Map(mapRef.current, {
        zoom: 12,
        center: { lat: 40.7128, lng: -74.0060 },
        mapTypeControl: false,
        fullscreenControl: true,
        streetViewControl: false,
        styles: darkMode ? darkMapStyle : lightMapStyle,
        ...options
      });

      mapInstanceRef.current = mapInstance;
      setIsInitialized(true);

      if (onMapInit) {
        const mapService = new GoogleMapsManager();
        mapService.setMap(mapInstance);
        onMapInit(mapService);
      }
    } catch (err) {
      console.error('Failed to initialize map:', err);
    }
  }, [isLoaded, options, darkMode, onMapInit, isInitialized]);

  // Update map styles when dark mode changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setOptions({
      styles: darkMode ? darkMapStyle : lightMapStyle
    });
  }, [darkMode]);

  return (
    <div className="w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
} 