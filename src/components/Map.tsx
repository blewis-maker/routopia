'use client';

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
if (!token) {
  console.error('Mapbox token not found');
} else {
  console.log('Mapbox token loaded');
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

  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    // Start with Colorado bounds
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

      // Initialize the marker
      locationMarker.current = new mapboxgl.Marker({
        element: markerEl,
        anchor: 'center'
      })
        .setLngLat([-105.2705, 40.0150]) // Default to Boulder, CO
        .addTo(map);

      // Add navigation controls in a vertical layout
      const nav = new mapboxgl.NavigationControl({
        showCompass: true,
        showZoom: true,
        visualizePitch: true
      });
      map.addControl(nav, 'right');

      // Add geolocate control
      const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: false,
        showAccuracyCircle: false,
        showUserLocation: false
      });
      map.addControl(geolocate, 'right');

      // Add scale control
      const scale = new mapboxgl.ScaleControl({
        maxWidth: 80,
        unit: 'imperial'
      });
      map.addControl(scale, 'bottom-left');

      // Handle geolocate events
      geolocate.on('geolocate', (position) => {
        const { longitude, latitude } = position.coords;
        if (locationMarker.current) {
          locationMarker.current.setLngLat([longitude, latitude]);
        }
      });

      // Handle map click
      map.on('click', (e) => {
        const { lng, lat } = e.lngLat;
        if (locationMarker.current) {
          locationMarker.current.setLngLat([lng, lat]);
        }
        onLocationSelect([lng, lat]);
      });

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

  useEffect(() => {
    if (!mapInstance.current || !locationMarker.current) return;
    
    // Handle location updates here
    if (startLocation) {
      locationMarker.current.setLngLat(startLocation);
    }
  }, [startLocation]);

  useImperativeHandle(ref, () => ({
    showResponse: (response: string) => {
      if (!locationMarker.current || !mapInstance.current) return;

      if (markerPopup.current) {
        markerPopup.current.remove();
      }

      const markerLocation = locationMarker.current.getLngLat();
      
      markerPopup.current = new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: false,
        offset: [15, -25],
        anchor: 'bottom-left',
        className: 'marker-popup',
        maxWidth: 'none'
      })
        .setLngLat(markerLocation)
        .setHTML(`
          <div class="popup-content">
            <div class="popup-text">${response}</div>
          </div>
        `)
        .addTo(mapInstance.current);
    }
  }));

  // Add marker styles
  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
      <style jsx global>{`
        .marker-container {
          width: 32px;
          height: 32px;
          cursor: pointer;
        }

        .marker {
          width: 100%;
          height: 100%;
          animation: bounce 0.5s ease-in-out infinite alternate;
        }

        .marker-inner {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          padding: 4px;
          position: relative;
        }

        .marker-pulse {
          position: absolute;
          top: -2px;
          left: -2px;
          width: calc(100% + 4px);
          height: calc(100% + 4px);
          border-radius: 50%;
          animation: pulse 2s ease-out infinite;
          pointer-events: none;
          border: none;
          background: radial-gradient(
            circle at center,
            rgba(0, 200, 150, 0.2) 0%,
            rgba(0, 200, 150, 0.1) 40%,
            rgba(0, 200, 150, 0.05) 60%,
            transparent 100%
          );
          box-shadow: 
            0 0 20px rgba(0, 200, 150, 0.15),
            0 0 30px rgba(0, 200, 150, 0.1);
          backdrop-filter: blur(2px);
        }

        @keyframes bounce {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(-10px);
          }
        }

        @keyframes pulse {
          0% {
            transform: scale(0.98);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }

        /* Map Controls Container */
        .mapboxgl-control-container {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
        }

        /* Vertical controls layout */
        .mapboxgl-ctrl-group {
          margin-bottom: 10px;
          background: rgba(38, 38, 38, 0.95) !important;
          border: 1px solid rgba(0, 200, 150, 0.3) !important;
          border-radius: 8px !important;
          overflow: hidden;
        }

        .mapboxgl-ctrl-group button {
          width: 36px !important;
          height: 36px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          border: none !important;
          border-bottom: 1px solid rgba(0, 200, 150, 0.3) !important;
          background-color: transparent !important;
          color: white !important;
        }

        .mapboxgl-ctrl-group button:last-child {
          border-bottom: none !important;
        }

        .mapboxgl-ctrl-group button:hover {
          background-color: rgba(0, 200, 150, 0.2) !important;
        }

        /* Scale control styling */
        .mapboxgl-ctrl-scale {
          background-color: rgba(38, 38, 38, 0.95) !important;
          border-color: rgba(0, 200, 150, 0.3) !important;
          color: white !important;
          padding: 4px 8px !important;
          border-radius: 4px !important;
        }

        /* Geolocate control specific styling */
        .mapboxgl-ctrl-geolocate {
          background-image: none !important;
        }

        .mapboxgl-ctrl-geolocate::before {
          content: '📍';
          font-size: 18px;
        }

        .marker-popup {
          z-index: 1000;
        }

        .marker-popup .mapboxgl-popup-content {
          background-color: rgba(38, 38, 38, 0.95) !important;
          border: 1px solid rgba(0, 200, 150, 0.3) !important;
          border-radius: 16px !important;
          padding: 12px 16px !important;
          color: white !important;
          font-size: 14px !important;
          line-height: 1.4 !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          position: relative;
          width: max-content;
          max-width: 300px;
        }

        .marker-popup .mapboxgl-popup-content:after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 15px;
          border-width: 8px 8px 0;
          border-style: solid;
          border-color: rgba(38, 38, 38, 0.95) transparent transparent;
          transform: rotate(-45deg);
        }

        .marker-popup .mapboxgl-popup-tip {
          display: none !important;
        }

        .popup-content {
          position: relative;
        }

        .popup-text {
          white-space: pre-wrap;
          word-wrap: break-word;
        }

        /* Smaller close button */
        .marker-popup .mapboxgl-popup-close-button {
          padding: 0 6px;
          font-size: 16px;
          color: rgba(255, 255, 255, 0.7);
          right: 4px;
          top: 4px;
          border-radius: 50%;
        }

        .marker-popup .mapboxgl-popup-close-button:hover {
          color: white;
          background: rgba(255, 255, 255, 0.1);
        }

        .mapboxgl-popup {
          animation: popup-fade-in 0.3s ease-out;
        }

        @keyframes popup-fade-in {
          from {
            opacity: 0;
            transform: translate(-10px, 10px);
          }
          to {
            opacity: 1;
            transform: translate(0, 0);
          }
        }
      `}</style>
    </div>
  );
});

Map.displayName = 'Map';

export default Map;
