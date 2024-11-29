'use client';

import { useState, useEffect } from 'react';
import { SearchBox } from './SearchBox';

interface Location {
  coordinates: [number, number];
  address: string;
}

interface RoutePanelProps {
  onClose: () => void;
  startLocation: Location | null;
  endLocation: Location | null;
  waypoints: Location[];
  onStartLocationChange: (location: Location) => void;
  onEndLocationChange: (location: Location) => void;
  onWaypointAdd: (location: Location) => void;
}

export function RoutePanel({
  onClose,
  startLocation,
  endLocation,
  waypoints,
  onStartLocationChange,
  onEndLocationChange,
  onWaypointAdd
}: RoutePanelProps) {
  return (
    <div className="absolute top-4 right-4 bg-stone-800/95 backdrop-blur-md p-6 rounded-lg shadow-lg w-96">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white text-lg font-semibold">Plan Your Route</h2>
        <button onClick={onClose} className="text-stone-400 hover:text-white">×</button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-stone-300 text-sm mb-1 block">Start Location</label>
          <SearchBox
            initialValue={startLocation?.address || ''}
            onSelect={(result) => onStartLocationChange(result)}
            placeholder="Enter start location"
          />
        </div>

        <div>
          <label className="text-stone-300 text-sm mb-1 block">Destination</label>
          <SearchBox
            initialValue={endLocation?.address || ''}
            onSelect={(result) => onEndLocationChange(result)}
            placeholder="Enter destination"
          />
        </div>
      </div>
    </div>
  );
} 