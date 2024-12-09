import { useEffect, useRef, useState } from 'react';
import { GoogleMapsManager } from '@/services/maps/GoogleMapsManager';
import { MapIntegrationLayer } from '@/services/maps/MapIntegrationLayer';
import { SearchBox } from '@/components/navigation/SearchBox';
import { Route } from '@/types/route/types';
import { Coordinates } from '@/services/maps/MapServiceInterface';

interface MapViewProps {
  center: [number, number];
  zoom: number;
  route: Route | null;
  onMapClick?: (coordinates: Coordinates) => void;
  showWeather?: boolean;
  showElevation?: boolean;
  showUserLocation?: boolean;
  darkMode?: boolean;
}

export function MapView({
  center,
  zoom,
  route,
  onMapClick,
  showWeather = false,
  showElevation = false,
  showUserLocation = true,
  darkMode = true
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapService, setMapService] = useState<GoogleMapsManager | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);

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

        // Add click handler
        if (onMapClick) {
          service.addClickListener((coords: Coordinates) => {
            onMapClick(coords);
          });
        }

        // Get user location if enabled
        if (showUserLocation && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              if (!isMounted) return;
              
              const location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };
              
              setUserLocation(location);
              service.setCenter(location);
              service.setZoom(14);
              service.addUserLocationMarker(location);
            },
            (error) => {
              if (isMounted) {
                console.warn('Geolocation error:', error);
                service.setCenter({ lat: center[1], lng: center[0] });
                service.setZoom(zoom);
              }
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            }
          );
        }

      } catch (error) {
        if (isMounted) {
          console.warn('Map initialization error:', error);
        }
      }
    };

    initMap();

    return () => {
      isMounted = false;
    };
  }, [center, zoom, darkMode, onMapClick, showUserLocation]);

  // Update map when route changes
  useEffect(() => {
    const visualizeRoute = async () => {
      if (!mapService || !route) return;

      try {
        await mapService.visualizeRoute(route);
      } catch (error) {
        console.error('Failed to visualize route:', error);
      }
    };

    visualizeRoute();
  }, [mapService, route]);

  return (
    <div className="w-full h-full relative">
      <div
        ref={mapContainerRef}
        className="w-full h-full"
        id="map-container"
      />
      
      {/* Search Bar */}
      <div className="absolute top-4 left-4 z-10">
        <SearchBox 
          onSelect={(result: SearchResult) => {
            if ('coordinates' in result) {
              const [lng, lat] = result.coordinates;
              setUserLocation({
                lat,
                lng
              });
            }
          }}
          placeholder="Set your starting point..."
          useCurrentLocation={true}
          className="w-96 max-w-[calc(100%-2rem)]"
        />
      </div>

      {showElevation && route && (
        <div
          id="elevation-chart"
          className="absolute bottom-0 left-0 right-0 h-32 bg-stone-900/90 backdrop-blur"
        />
      )}
    </div>
  );
} 