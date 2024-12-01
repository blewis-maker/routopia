'use client';

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
if (!token) {
  throw new Error('Mapbox token not found');
} else {
  mapboxgl.accessToken = token;
}

interface Location {
  coordinates: [number, number];
  address: string;
}

interface MapProps {
  startLocation: [number, number] | null;
  endLocation: [number, number] | null;
  waypoints: [number, number][];
  onLocationSelect: (coords: [number, number]) => void;
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
}: MapProps, ref) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const locationMarker = useRef<mapboxgl.Marker | null>(null);
  const markerPopup = useRef<mapboxgl.Popup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const currentLocation = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    const coloradoBounds = [
      [-109.0448, 36.9924], // Southwest coordinates
      [-102.0424, 41.0034]  // Northeast coordinates
    ];

    try {
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        bounds: coloradoBounds,
        fitBoundsOptions: {
          padding: 20
        },
        pitch: 0,
        bearing: 0
      });

      // Create the marker element with animations
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

      // Initialize marker but don't add it to the map yet
      locationMarker.current = new mapboxgl.Marker({
        element: markerEl,
        anchor: 'center'
      });

      // Add geolocate control
      const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showAccuracyCircle: false,
        showUserLocation: false
      });
      map.addControl(geolocate, 'right');

      // Handle geolocate events
      geolocate.on('geolocate', (position) => {
        const { longitude, latitude } = position.coords;
        currentLocation.current = { lat: latitude, lng: longitude };
        
        // Only add/update marker when we have a valid location
        if (locationMarker.current) {
          locationMarker.current.setLngLat([longitude, latitude]);
          if (!locationMarker.current.getElement().parentNode) {
            locationMarker.current.addTo(map);
          }
        }
      });

      // Keep all other existing controls
      const nav = new mapboxgl.NavigationControl({
        showCompass: true,
        showZoom: true,
        visualizePitch: true
      });
      map.addControl(nav, 'right');

      const scale = new mapboxgl.ScaleControl({
        maxWidth: 80,
        unit: 'imperial'
      });
      map.addControl(scale, 'bottom-left');

      // Handle map load
      map.on('load', () => {
        console.log('Map loaded successfully');
        setIsLoading(false);
        // Trigger geolocate on load
        geolocate.trigger();
      });

      mapInstance.current = map;

    } catch (error) {
      console.error('Map initialization error:', error);
      setIsLoading(false);
    }

    return () => {
      if (locationMarker.current) {
        locationMarker.current.remove();
      }
      if (mapInstance.current) {
        mapInstance.current.remove();
      }
      mapInstance.current = null;
    };
  }, []);

  // Add back the useImperativeHandle for chat responses
  useImperativeHandle(ref, () => ({
    showResponse: (response: string) => {
      if (markerPopup.current) {
        markerPopup.current.remove();
      }
      
      if (currentLocation.current && mapInstance.current) {
        markerPopup.current = new mapboxgl.Popup({ 
          closeButton: false,
          className: 'chat-popup',
          offset: [0, -15]
        })
          .setLngLat([currentLocation.current.lng, currentLocation.current.lat])
          .setHTML(`
            <div class="bg-white text-black p-4 rounded-lg shadow-lg max-w-sm">
              ${response}
            </div>
          `)
          .addTo(mapInstance.current);
      }
    },
    getCurrentLocation: () => currentLocation.current
  }));

  // Add the CSS for the bouncing animation
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
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
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
