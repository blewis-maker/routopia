'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { mapConfig } from '@/config/map';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set the access token
mapboxgl.accessToken = mapConfig.accessToken;

interface MapViewProps {
  center?: [number, number];
  zoom?: number;
}

export function MapView({ 
  center = mapConfig.defaultCenter, 
  zoom = mapConfig.defaultZoom 
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapConfig.style,
      center: center,
      zoom: zoom,
    });

    return () => {
      map.current?.remove();
    };
  }, [center, zoom]);

  return <div ref={mapContainer} className="w-full h-full" />;
} 