import { useEffect, useRef, useState } from 'react';
import { GoogleMapsManager } from '@/services/maps/GoogleMapsManager';
import { ElevationLayer } from '@/services/maps/ElevationLayer';
import { WeatherLayer } from '@/services/maps/WeatherLayer';
import { MapServiceInterface, Coordinates } from '@/services/maps/MapServiceInterface';
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
  const [mapService, setMapService] = useState<GoogleMapsManager | null>(null);
  const [weatherLayer] = useState(() => new WeatherLayer());
  const [elevationLayer] = useState(() => new ElevationLayer());
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);

  // Initialize map
  useEffect(() => {
    let isMounted = true;
    let mapInstance: google.maps.Map | null = null;

    const initMap = async () => {
      if (!mapContainerRef.current || !isMounted) return;

      try {
        // Load Google Maps
        await GoogleMapsLoader.getInstance().load();

        // Create map instance with default center
        mapInstance = new google.maps.Map(mapContainerRef.current, {
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

        if (!isMounted) return;

        mapInstanceRef.current = mapInstance;

        // Initialize service
        const service = new GoogleMapsManager();
        if (isMounted) {
          setMapService(service);
        }

        // Add click handler
        if (onMapClick && isMounted) {
          mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
              onMapClick({
                lat: e.latLng.lat(),
                lng: e.latLng.lng()
              });
            }
          });
        }

        // Get user location if enabled
        if (showUserLocation && navigator.geolocation && isMounted) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              if (!isMounted || !mapInstance) return;
              
              const location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };
              
              setUserLocation(location);
              mapInstance.setCenter(location);
              mapInstance.setZoom(14);

              // Create user location marker
              if (userMarkerRef.current) {
                userMarkerRef.current.setPosition(location);
              } else {
                const marker = new google.maps.Marker({
                  position: location,
                  map: mapInstance,
                  icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor: '#10B981',
                    fillOpacity: 1,
                    strokeColor: '#FFFFFF',
                    strokeWeight: 2,
                    scale: 8
                  }
                });
                userMarkerRef.current = marker;
              }
            },
            (error) => {
              if (isMounted) {
                console.warn('Geolocation error:', error);
                mapInstance?.setCenter({ lat: center[1], lng: center[0] });
                mapInstance?.setZoom(zoom);
              }
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            }
          );
        }

        // Initialize weather layer if enabled
        if (showWeather && isMounted) {
          const weatherLayer = new WeatherLayer();
          weatherLayer.showWeatherOverlay(mapInstance, { lat: center[1], lng: center[0] });
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
      if (mapInstanceRef.current) {
        google.maps.event.clearInstanceListeners(mapInstanceRef.current);
      }
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
      }
    };
  }, [center, zoom, onMapClick, showUserLocation, showWeather]);

  // Update map center and zoom when props change
  useEffect(() => {
    if (mapInstanceRef.current && !userLocation) {
      mapInstanceRef.current.setCenter({ lat: center[1], lng: center[0] });
      mapInstanceRef.current.setZoom(zoom);
    }
  }, [center, zoom, userLocation]);

  // Handle route visualization
  useEffect(() => {
    if (!mapService || !route || !mapInstanceRef.current) return;

    const visualizeRoute = async () => {
      try {
        if (!mapInstanceRef.current) return;

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
            route.segments.map(segment => ({
              lat: segment.startPoint.latitude,
              lng: segment.startPoint.longitude
            }))
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