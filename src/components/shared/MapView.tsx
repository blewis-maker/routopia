import { useEffect, useRef, useState } from 'react';
import { MapboxManager } from '@/services/maps/MapboxManager';
import { GoogleMapsManager } from '@/services/maps/GoogleMapsManager';
import { ElevationLayer } from '@/services/maps/ElevationLayer';
import { WeatherLayer } from '@/services/maps/WeatherLayer';
import { MapServiceInterface, Coordinates, RouteVisualization, RouteOptions } from '@/services/maps/MapServiceInterface';
import { Route } from '@/types/route/types';
import GoogleMapsLoader from '@/services/maps/GoogleMapsLoader';
import mapboxgl from 'mapbox-gl';

interface MapViewProps {
  center: [number, number];
  zoom: number;
  route?: Route | null;
  onMapClick?: (coordinates: Coordinates) => void;
  onMarkerDrag?: (coordinates: Coordinates) => void;
  showWeather?: boolean;
  showElevation?: boolean;
}

export function MapView({
  center,
  zoom,
  route,
  onMapClick,
  onMarkerDrag,
  showWeather = true,
  showElevation = true
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapService, setMapService] = useState<MapServiceInterface | null>(null);
  const [weatherLayer] = useState(() => new WeatherLayer());
  const [elevationLayer] = useState(() => new ElevationLayer());

  // Initialize map service
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initMap = async () => {
      // Initialize Google Maps Loader for services
      await GoogleMapsLoader.getInstance().load();
      
      // Use Mapbox for the base map
      const service = new MapboxManager();
      await service.initialize('map-container', {
        center: { lat: center[1], lng: center[0] },
        zoom,
        style: 'mapbox://styles/mapbox/dark-v11'
      });

      // Add click handler to the Mapbox map instance
      if (onMapClick && service.map) {
        service.map.on('click', (e: mapboxgl.MapMouseEvent) => {
          onMapClick({
            lat: e.lngLat.lat,
            lng: e.lngLat.lng
          });
        });
      }

      setMapService(service);
    };

    initMap();

    // Cleanup
    return () => {
      if (mapService && (mapService as MapboxManager).map) {
        (mapService as MapboxManager).map?.off('click');
      }
    };
  }, [center, zoom, onMapClick]);

  // Handle route updates
  useEffect(() => {
    if (!mapService || !route) return;

    const visualizeRoute = async () => {
      const routeVisualization: RouteVisualization = {
        mainRoute: {
          coordinates: route.segments.map(segment => ({
            lat: segment.startPoint.latitude,
            lng: segment.startPoint.longitude
          }))
        },
        waypoints: {
          start: {
            lat: route.segments[0].startPoint.latitude,
            lng: route.segments[0].startPoint.longitude
          },
          end: {
            lat: route.segments[route.segments.length - 1].endPoint.latitude,
            lng: route.segments[route.segments.length - 1].endPoint.longitude
          },
          via: []
        }
      };

      const options: RouteOptions = {
        activityType: route.preferences.activityType.toLowerCase() as 'car' | 'bike' | 'ski',
        showTraffic: true,
        showAlternatives: true,
        isInteractive: true
      };

      await mapService.drawRoute(routeVisualization, options);

      // Show weather at route end point if enabled
      if (showWeather) {
        const endPoint = route.segments[route.segments.length - 1].endPoint;
        await weatherLayer.showWeatherOverlay(mapService as any, {
          lat: endPoint.latitude,
          lng: endPoint.longitude
        });
      }

      // Show elevation profile if enabled
      if (showElevation) {
        const elevationData = await elevationLayer.getElevationData(
          routeVisualization.mainRoute.coordinates
        );
        await elevationLayer.visualizeElevation(mapService as any, elevationData);
      }
    };

    visualizeRoute();
  }, [mapService, route, showWeather, showElevation, weatherLayer, elevationLayer]);

  return (
    <div className="w-full h-full relative">
      <div
        id="map-container"
        ref={mapContainerRef}
        className="w-full h-full"
      />
      {showElevation && (
        <div
          id="elevation-chart"
          className="absolute bottom-0 left-0 right-0 h-32 bg-stone-900/90 backdrop-blur"
        />
      )}
    </div>
  );
} 