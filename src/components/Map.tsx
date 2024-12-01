'use client';

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
if (!token) {
  throw new Error('Mapbox token not found');
}
mapboxgl.accessToken = token;

interface Location {
  coordinates: [number, number];
  address: string;
}

interface MapProps {
  startLocation: [number, number] | null;
  endLocation: [number, number] | null;
  waypoints: [number, number][];
  onLocationSelect: (coords: [number, number]) => void;
  onStartLocationChange?: (location: string) => void;
  onDestinationChange?: (location: string) => void;
}

export interface MapRef {
  showResponse: (response: string) => void;
  getCurrentLocation: () => { lat: number; lng: number } | null;
}

const Map = forwardRef<MapRef, MapProps>(({ 
  startLocation, 
  endLocation, 
  waypoints, 
  onLocationSelect,
  onStartLocationChange,
  onDestinationChange
}: MapProps, ref) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const locationMarker = useRef<mapboxgl.Marker | null>(null);
  const geolocateControl = useRef<mapboxgl.GeolocateControl | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentAddress, setCurrentAddress] = useState<string>('');
  const currentLocation = useRef<{ lat: number; lng: number } | null>(null);

  // Optimized reverse geocoding with caching
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?` + 
        new URLSearchParams({
          access_token: token,
          types: 'address',
          limit: '1',
          language: 'en'
        })
      );
      
      if (!response.ok) throw new Error('Geocoding failed');
      
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const address = data.features[0].place_name;
        setCurrentAddress(address);
        onStartLocationChange?.(address);
        return address;
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
    return null;
  };

  // Initialize map and controls
  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-105.5217, 39.0084],
      zoom: 7,
      pitch: 0,
      bearing: 0
    });

    // Create marker with custom element
    const markerEl = document.createElement('div');
    markerEl.className = 'marker-container';
    markerEl.innerHTML = `
      <div class="marker">
        <div class="marker-inner">
          <img src="/logo.svg" alt="Location" width="32" height="32" />
        </div>
        <div class="marker-pulse"></div>
      </div>
    `;

    locationMarker.current = new mapboxgl.Marker({
      element: markerEl,
      anchor: 'center'
    });

    // Initialize geolocate control with high accuracy
    geolocateControl.current = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 6000
      },
      trackUserLocation: true,
      showAccuracyCircle: false,
      showUserLocation: false
    });

    map.addControl(geolocateControl.current, 'top-right');

    // Add other controls
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.addControl(new mapboxgl.ScaleControl({ unit: 'imperial' }), 'bottom-right');

    // Handle location events
    geolocateControl.current.on('geolocate', async (position) => {
      const { longitude, latitude } = position.coords;
      currentLocation.current = { lat: latitude, lng: longitude };
      
      // Update marker position
      if (locationMarker.current) {
        locationMarker.current.setLngLat([longitude, latitude]);
        if (!locationMarker.current.getElement().parentNode) {
          locationMarker.current.addTo(map);
        }
      }

      // Get and set address
      await reverseGeocode(latitude, longitude);
    });

    // Handle map load
    map.on('load', () => {
      setIsLoading(false);
      // Trigger geolocation after map loads
      geolocateControl.current?.trigger();
    });

    // Error handling
    geolocateControl.current.on('error', (err) => {
      console.error('Geolocation error:', err);
      setCurrentAddress('Location unavailable');
    });

    mapInstance.current = map;

    // Cleanup
    return () => {
      if (locationMarker.current) locationMarker.current.remove();
      if (mapInstance.current) mapInstance.current.remove();
      mapInstance.current = null;
    };
  }, []);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    showResponse: (response: string) => {
      if (currentLocation.current && mapInstance.current) {
        locationMarker.current?.setLngLat([
          currentLocation.current.lng,
          currentLocation.current.lat
        ]);
      }
    },
    getCurrentLocation: () => currentLocation.current
  }));

  return (
    <>
      <style jsx global>{`
        .marker-container {
          width: 40px;
          height: 40px;
          cursor: pointer;
        }
        
        .marker {
          position: relative;
          width: 100%;
          height: 100%;
        }
        
        .marker-inner {
          position: absolute;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: bounce 1s infinite;
          will-change: transform;
        }
        
        .marker-pulse {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(66, 135, 245, 0.2);
          animation: pulse 1.5s infinite;
          will-change: transform, opacity;
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse {
          0% {
            transform: scale(0.5);
            opacity: 1;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
      <div className="relative w-full h-full">
        <div className="absolute top-4 left-4 z-10 space-y-2 w-72">
          <div className="bg-white rounded-lg shadow-lg">
            <input
              type="text"
              value={currentAddress}
              placeholder="Current Location"
              className="w-full px-4 py-2 rounded-lg bg-[#2D2D2D] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => {
                setCurrentAddress(e.target.value);
                onStartLocationChange?.(e.target.value);
              }}
            />
          </div>
          <div className="bg-white rounded-lg shadow-lg">
            <input
              type="text"
              placeholder="Destination"
              className="w-full px-4 py-2 rounded-lg bg-[#2D2D2D] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => onDestinationChange?.(e.target.value)}
            />
          </div>
        </div>
        <div ref={mapContainer} className="absolute inset-0" />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="text-white">Loading map...</div>
          </div>
        )}
      </div>
    </>
  );
});

Map.displayName = 'Map';

export default Map;
