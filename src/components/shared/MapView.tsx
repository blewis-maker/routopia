import { useEffect, useRef, useState } from 'react';
import { GoogleMapsManager } from '@/services/maps/GoogleMapsManager';
import { ElevationLayer } from '@/services/maps/ElevationLayer';
import { WeatherLayer } from '@/services/maps/WeatherLayer';
import { MapServiceInterface, Coordinates } from '@/services/maps/MapServiceInterface';
import { Route } from '@/types/route/types';
import { WeatherWidget } from '@/components/shared/WeatherWidget';
import { useWeatherData } from '@/hooks/useWeatherData';
import { Sun, Cloud, CloudRain, CloudSnow, CloudFog } from 'lucide-react';
import { SearchBox } from '@/components/navigation/SearchBox';

interface SearchResult {
  coordinates: [number, number];
  place_name: string;
  [key: string]: any;
}

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
  const [elevationLayer] = useState(() => new ElevationLayer());
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const { data: weatherData, loading: weatherLoading, error: weatherError } = useWeatherData(userLocation);

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

        if (showElevation) {
          const elevationData = await Promise.all(
            route.segments.map(segment => 
              elevationLayer.getElevationData([
                [segment.startPoint.longitude, segment.startPoint.latitude],
                [segment.endPoint.longitude, segment.endPoint.latitude]
              ])
            )
          );
          await elevationLayer.visualizeElevation(mapService.getMap(), elevationData);
        }
      } catch (error) {
        console.error('Failed to visualize route:', error);
      }
    };

    visualizeRoute();
  }, [mapService, route, showElevation]);

  // Weather icon mapping
  const getWeatherIcon = (condition: string) => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('clear')) return <Sun className="h-5 w-5 text-yellow-400" />;
    if (conditionLower.includes('cloud')) return <Cloud className="h-5 w-5 text-stone-400" />;
    if (conditionLower.includes('rain')) return <CloudRain className="h-5 w-5 text-blue-400" />;
    if (conditionLower.includes('snow')) return <CloudSnow className="h-5 w-5 text-blue-200" />;
    if (conditionLower.includes('fog') || conditionLower.includes('mist')) return <CloudFog className="h-5 w-5 text-stone-400" />;
    return <Sun className="h-5 w-5 text-yellow-400" />;
  };

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

      {/* Centered Weather Widget */}
      {showWeather && userLocation && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-stone-800/90 backdrop-blur rounded-lg px-4 py-2 flex items-center gap-3 shadow-lg">
            {weatherData && (
              <>
                {getWeatherIcon(weatherData.condition)}
                <div className="text-lg font-medium text-white">
                  {weatherData.temperature}°F
                </div>
                <div className="text-stone-400 text-sm border-l border-stone-600 pl-3 ml-1">
                  {weatherData.condition}
                </div>
                <div className="text-stone-400 text-sm border-l border-stone-600 pl-3 ml-1 flex gap-4">
                  <span>Wind: {Math.round(weatherData.windSpeed)} mph</span>
                  <span>Humidity: {weatherData.humidity}%</span>
                </div>
              </>
            )}
            {weatherLoading && (
              <div className="animate-pulse flex items-center gap-3">
                <div className="w-5 h-5 bg-stone-700 rounded-full"></div>
                <div className="h-5 w-16 bg-stone-700 rounded"></div>
                <div className="h-5 w-20 bg-stone-700 rounded ml-3"></div>
                <div className="h-5 w-48 bg-stone-700 rounded ml-3"></div>
              </div>
            )}
          </div>
        </div>
      )}

      {showElevation && route && (
        <div
          id="elevation-chart"
          className="absolute bottom-0 left-0 right-0 h-32 bg-stone-900/90 backdrop-blur"
        />
      )}
    </div>
  );
} 