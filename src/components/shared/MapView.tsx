'use client';

import { useEffect, useRef } from 'react';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { GoogleMapsManager } from '@/services/maps/GoogleMapsManager';

interface MapViewProps {
  options?: google.maps.MapOptions;
  showWeather?: boolean;
  showUserLocation?: boolean;
  darkMode?: boolean;
  onMapInit?: (mapService: GoogleMapsManager) => void;
}

const darkMapStyle: google.maps.MapTypeStyle[] = [
  {
    featureType: 'all',
    elementType: 'geometry',
    stylers: [{ color: '#242f3e' }]
  }
];

const lightMapStyle: google.maps.MapTypeStyle[] = [
  {
    featureType: 'all',
    elementType: 'geometry',
    stylers: [{ color: '#f5f5f5' }]
  }
];

export function MapView({
  options = {},
  showWeather = false,
  showUserLocation = false,
  darkMode = false,
  onMapInit
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const mapServiceRef = useRef<GoogleMapsManager | null>(null);
  const { isLoaded } = useGoogleMaps();

  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;

    try {
      const mapInstance = new google.maps.Map(mapRef.current, {
        zoom: 12,
        center: { lat: 40.7128, lng: -74.0060 },
        mapId: process.env.NEXT_PUBLIC_GOOGLE_MAP_ID,
        mapTypeControl: false,
        fullscreenControl: true,
        streetViewControl: false,
        zoomControl: false,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_BOTTOM
        }
      });

      // Create the dark mode style
      const darkModeMap = new google.maps.StyledMapType(
        darkMapStyle,
        { name: "Dark Mode" }
      );

      // Register it with the map
      mapInstance.mapTypes.set('dark_mode', darkModeMap);
      
      // Set initial map type based on dark mode
      mapInstance.setMapTypeId(darkMode ? 'dark_mode' : google.maps.MapTypeId.ROADMAP);

      mapInstanceRef.current = mapInstance;

      if (onMapInit && !mapServiceRef.current) {
        const mapService = new GoogleMapsManager();
        mapService.setMapInstance(mapInstance);
        mapServiceRef.current = mapService;
        onMapInit(mapService);
      }
    } catch (err) {
      console.error('Failed to initialize map:', err);
    }
  }, [isLoaded, options, darkMode, onMapInit]);

  // Update map type when dark mode changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setMapTypeId(
      darkMode ? 'dark_mode' : google.maps.MapTypeId.ROADMAP
    );
  }, [darkMode]);

  return (
    <div className="w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
} 