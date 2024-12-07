'use client';

import { useEffect, useRef, forwardRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

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

const Map = forwardRef<MapRef, MapProps>((props, ref) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-74.5, 40],
      zoom: 9
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    }));

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <div ref={mapContainer} className="h-full w-full" />
  );
});

Map.displayName = 'Map';
export default Map;
