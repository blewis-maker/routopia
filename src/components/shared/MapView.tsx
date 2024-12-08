import { useEffect, useRef, useState } from 'react';
import { GoogleMapsManager } from '@/services/maps/GoogleMapsManager';
import { ElevationLayer } from '@/services/maps/ElevationLayer';
import { WeatherLayer } from '@/services/maps/WeatherLayer';
import { MapServiceInterface, Coordinates } from '@/services/maps/MapServiceInterface';
import { Route } from '@/types/route/types';

interface MapViewProps {
  center: [number, number];
  zoom: number;
  route: Route | null;
  onMapClick: (coordinates: Coordinates) => Promise<void>;
  showWeather: boolean;
  showElevation: boolean;
  showUserLocation: boolean;
  darkMode?: boolean;
}

export function MapView({
  center,
  zoom,
  route,
  onMapClick,
  showWeather = true,
  showElevation = true,
  showUserLocation = true,
  darkMode = true
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapService, setMapService] = useState<GoogleMapsManager | null>(null);
  const [weatherLayer] = useState(() => new WeatherLayer());
  const [elevationLayer] = useState(() => new ElevationLayer());
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

              // Update weather widget with user location
              if (showWeather) {
                weatherLayer.showWeatherOverlay(service.getMap(), location);
              }
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
      if (mapService) {
        mapService.cleanup();
      }
    };
  }, []);

  // Update map center and zoom when props change
  useEffect(() => {
    if (mapService && !userLocation) {
      mapService.setCenter({ lat: center[1], lng: center[0] });
      mapService.setZoom(zoom);
    }
  }, [center, zoom, userLocation, mapService]);

  // Handle route visualization
  useEffect(() => {
    if (!mapService || !route) return;

    const visualizeRoute = async () => {
      try {
        // Show weather at route end point if enabled
        if (showWeather) {
          const endPoint = route.segments[route.segments.length - 1].endPoint;
          await weatherLayer.showWeatherOverlay(mapService.getMap(), {
            lat: endPoint.latitude,
            lng: endPoint.longitude
          });
        }

        // Show elevation profile if enabled
        if (showElevation) {
          const elevationData = await elevationLayer.getElevationData(
            route.segments.map(segment => ({
              lat: segment.startPoint.latitude,
              lng: segment.startPoint.longitude
            }))
          );
          await elevationLayer.visualizeElevation(mapService.getMap(), elevationData);
        }
      } catch (error) {
        console.error('Failed to visualize route:', error);
      }
    };

    visualizeRoute();
  }, [mapService, route, showWeather, showElevation]);

  return (
    <div className="w-full h-full relative">
      <div
        ref={mapContainerRef}
        className="w-full h-full"
        id="map-container"
      />
      {showElevation && route && (
        <div
          id="elevation-chart"
          className="absolute bottom-0 left-0 right-0 h-32 bg-stone-900/90 backdrop-blur"
        />
      )}
    </div>
  );
} 