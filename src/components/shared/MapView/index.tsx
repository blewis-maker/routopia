'use client';

import { useEffect, useRef, useState } from 'react';
import { mapboxService } from '@/services/mapbox/client';
import type { Map as MapboxMap } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapViewProps {
  center?: [number, number];
  zoom?: number;
  onMapLoad?: (map: MapboxMap) => void;
  className?: string;
}

export function MapView({
  center = [-74.5, 40],
  zoom = 9,
  onMapLoad,
  className = '',
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<MapboxMap | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = mapboxService.createMap({
      container: mapContainer.current,
      center,
      zoom,
    });

    map.current.on('load', () => {
      setLoaded(true);
      if (onMapLoad && map.current) {
        onMapLoad(map.current);
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [center, zoom, onMapLoad]);

  return (
    <div 
      ref={mapContainer} 
      className={`map-view w-full h-full min-h-[400px] ${className}`}
    />
  );
} 