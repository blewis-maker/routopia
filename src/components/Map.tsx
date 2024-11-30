'use client';

import { useEffect, useRef } from 'react';
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
  startLocation: Location | null;
  endLocation: Location | null;
  waypoints: Location[];
  onLocationSelect: (location: Location, type: 'start' | 'end' | 'waypoint') => void;
}

export default function Map({ 
  startLocation, 
  endLocation, 
  waypoints, 
  onLocationSelect,
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const locationMarker = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      zoom: 15,
      pitch: 0,
      bearing: 0
    });

    const markerEl = document.createElement('div');
    markerEl.className = 'marker';
    markerEl.innerHTML = `
      <div class="marker-inner">
        <img src="/logo.svg" alt="Location" />
      </div>
    `;

    locationMarker.current = new mapboxgl.Marker({
      element: markerEl,
      anchor: 'center'
    });

    const nav = new mapboxgl.NavigationControl({
      showCompass: false
    });
    map.addControl(nav, 'top-right');

    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: false,
      showAccuracyCircle: false,
      showUserLocation: false
    });
    map.addControl(geolocate);

    geolocate.on('geolocate', (e: any) => {
      const { latitude, longitude } = e.coords;
      
      if (locationMarker.current) {
        locationMarker.current
          .setLngLat([longitude, latitude])
          .addTo(map);
      }

      map.flyTo({
        center: [longitude, latitude],
        zoom: 15,
        pitch: 0,
        bearing: 0,
        duration: 1500,
        essential: true
      });
    });

    map.once('load', () => {
      geolocate.trigger();
    });

    mapInstance.current = map;

    return () => {
      if (locationMarker.current) {
        locationMarker.current.remove();
      }
      map.remove();
      mapInstance.current = null;
    };
  }, [startLocation]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
      <style jsx global>{`
        .marker {
          width: 32px;
          height: 32px;
          cursor: pointer;
        }

        .marker-inner {
          width: 100%;
          height: 100%;
          position: relative;
          animation: bounce 1s infinite ease-in-out;
        }

        .marker-inner img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: brightness(0) invert(1);
          filter: drop-shadow(0 0 8px rgba(0, 200, 150, 0.6));
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        .mapboxgl-ctrl-top-right {
          right: 270px !important;
        }

        .mapboxgl-ctrl-compass {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
