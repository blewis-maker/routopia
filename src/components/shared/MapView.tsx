import { useEffect, useRef, useState } from 'react';
import { GoogleMapsManager } from '@/services/maps/GoogleMapsManager';
import { ElevationLayer } from '@/services/maps/ElevationLayer';
import { WeatherLayer } from '@/services/maps/WeatherLayer';
import { MapServiceInterface, Coordinates, RouteVisualization, RouteOptions } from '@/services/maps/MapServiceInterface';
import { Route } from '@/types/route/types';
import GoogleMapsLoader from '@/services/maps/GoogleMapsLoader';

const DARK_MODE_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

interface MapViewProps {
  center: [number, number];
  zoom: number;
  route?: Route | null;
  onMapClick?: (coordinates: Coordinates) => void;
  onMarkerDrag?: (coordinates: Coordinates) => void;
  showWeather?: boolean;
  showElevation?: boolean;
  showUserLocation?: boolean;
}

export function MapView({
  center,
  zoom,
  route,
  onMapClick,
  onMarkerDrag,
  showWeather = true,
  showElevation = true,
  showUserLocation = true
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const [mapService, setMapService] = useState<MapServiceInterface | null>(null);
  const [weatherLayer] = useState(() => new WeatherLayer());
  const [elevationLayer] = useState(() => new ElevationLayer());
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);

  // Get user's location
  useEffect(() => {
    if (showUserLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  }, [showUserLocation]);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initMap = async () => {
      try {
        // Initialize Google Maps
        await GoogleMapsLoader.getInstance().load();
        
        const mapInstance = new google.maps.Map(mapContainerRef.current, {
          center: { lat: center[1], lng: center[0] },
          zoom: zoom,
          styles: DARK_MODE_STYLES,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: true,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: false
        });

        mapInstanceRef.current = mapInstance;
        
        // Initialize map service
        const service = new GoogleMapsManager(mapInstance);
        
        // Add click handler
        if (onMapClick) {
          mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
              onMapClick({
                lat: e.latLng.lat(),
                lng: e.latLng.lng()
              });
            }
          });
        }

        setMapService(service);
      } catch (error) {
        console.error('Failed to initialize map:', error);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        // Clean up event listeners and markers
        google.maps.event.clearInstanceListeners(mapInstanceRef.current);
        if (userMarkerRef.current) {
          userMarkerRef.current.setMap(null);
        }
      }
    };
  }, []);

  // Update map center and zoom when props change
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter({ lat: center[1], lng: center[0] });
      mapInstanceRef.current.setZoom(zoom);
    }
  }, [center, zoom]);

  // Add user location marker
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation) return;

    // Remove existing marker
    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
    }

    // Create new marker
    userMarkerRef.current = new google.maps.Marker({
      position: { lat: userLocation.lat, lng: userLocation.lng },
      map: mapInstanceRef.current,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#10B981',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
      title: 'Your Location'
    });

    // Add pulse effect
    const pulseEffect = new google.maps.Marker({
      position: { lat: userLocation.lat, lng: userLocation.lng },
      map: mapInstanceRef.current,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 16,
        fillColor: '#10B981',
        fillOpacity: 0.2,
        strokeColor: '#10B981',
        strokeWeight: 1,
        strokeOpacity: 0.4,
      },
      optimized: false,
    });

    // Animate pulse
    let scale = 16;
    const animate = () => {
      scale = scale > 30 ? 16 : scale + 0.5;
      if (pulseEffect.getIcon()) {
        const icon = { ...pulseEffect.getIcon() as google.maps.Symbol };
        icon.scale = scale;
        pulseEffect.setIcon(icon);
      }
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
      }
      pulseEffect.setMap(null);
    };
  }, [userLocation]);

  // Handle route visualization
  useEffect(() => {
    if (!mapService || !route || !mapInstanceRef.current) return;

    const visualizeRoute = async () => {
      try {
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
          await weatherLayer.showWeatherOverlay(mapInstanceRef.current, {
            lat: endPoint.latitude,
            lng: endPoint.longitude
          });
        }

        // Show elevation profile if enabled
        if (showElevation) {
          const elevationData = await elevationLayer.getElevationData(
            routeVisualization.mainRoute.coordinates
          );
          await elevationLayer.visualizeElevation(mapInstanceRef.current, elevationData);
        }
      } catch (error) {
        console.error('Failed to visualize route:', error);
      }
    };

    visualizeRoute();
  }, [mapService, route, showWeather, showElevation, weatherLayer, elevationLayer]);

  return (
    <div className="w-full h-full relative">
      <div
        ref={mapContainerRef}
        className="w-full h-full"
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