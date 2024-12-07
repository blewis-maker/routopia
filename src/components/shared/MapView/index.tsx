'use client';

import React from 'react';
import type { Map } from 'mapbox-gl';

interface MapViewProps {
  center?: [number, number];
  zoom?: number;
  onMapLoad?: (map: Map) => void;
  className?: string;
  markers?: Array<{
    id: string;
    position: [number, number];
    label: string;
  }>;
  route?: {
    id: string;
    coordinates: Array<[number, number]>;
  };
}

export const MapView: React.FC<MapViewProps> = ({
  center = [-74.5, 40],
  zoom = 9,
  onMapLoad,
  className,
  markers,
  route,
}) => {
  return (
    <div className={`h-full w-full ${className || ''}`}>
      Map View Component (Mock)
      {markers?.map(marker => (
        <div key={marker.id}>Marker: {marker.label}</div>
      ))}
      {route && <div>Route with {route.coordinates.length} points</div>}
    </div>
  );
}; 