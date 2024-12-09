import { useEffect, useRef, useState } from 'react';
import { GoogleMapsManager } from '@/services/maps/GoogleMapsManager';
import { MapIntegrationLayer } from '@/services/maps/MapIntegrationLayer';
import { SearchBox } from '@/components/navigation/SearchBox';
import { Route } from '@/types/route/types';
import { Coordinates } from '@/services/maps/MapServiceInterface';

interface MapViewProps {
  center: [number, number];
  zoom: number;
  route?: Route;
  onMapClick?: (coordinates: Coordinates) => void;
  showWeather?: boolean;
  showElevation?: boolean;
  showUserLocation?: boolean;
  darkMode?: boolean;
  onMapInit?: (service: GoogleMapsManager) => void;
}

export function MapView({
  center,
  zoom,
  route,
  onMapClick,
  showWeather = false,
  showElevation = false,
  showUserLocation = true,
  darkMode = true,
  onMapInit
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapService, setMapService] = useState<GoogleMapsManager | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize map
  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      if (!mapContainerRef.current || !isMounted) return;

      try {
        const service = new GoogleMapsManager();
        await service.initialize('map-container', {
          center: { lat: center[1], lng: center[0] },
          zoom,
          darkMode
        });

        if (!isMounted) return;

        setMapService(service);
        setIsInitialized(true);
        onMapInit?.(service);

        // Add click handler
        if (onMapClick) {
          service.addClickListener((coords: Coordinates) => {
            onMapClick(coords);
          });
        }
      } catch (error) {
        if (isMounted) {
          console.error('Map initialization error:', error);
        }
      }
    };

    initMap();

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle center and zoom updates
  useEffect(() => {
    if (!mapService || !isInitialized) return;

    console.log('Updating map center:', { lat: center[1], lng: center[0] });
    mapService.setCenter({ lat: center[1], lng: center[0] });
    mapService.setZoom(zoom);
  }, [mapService, isInitialized, center, zoom]);

  // Update map when route changes
  useEffect(() => {
    const visualizeRoute = async () => {
      if (!mapService || !route || !isInitialized) return;

      try {
        await mapService.visualizeRoute(route);
      } catch (error) {
        console.error('Failed to visualize route:', error);
      }
    };

    visualizeRoute();
  }, [mapService, route, isInitialized]);

  return (
    <div className="w-full h-full relative">
      <div
        ref={mapContainerRef}
        className="w-full h-full"
        id="map-container"
      />
    </div>
  );
} 