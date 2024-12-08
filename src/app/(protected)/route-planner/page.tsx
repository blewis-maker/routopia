'use client';

import { useState } from 'react';
import type { Location, SearchResult as GlobalSearchResult } from '@/types';
import { MapView } from '@/components/shared/MapView';
import { WeatherWidget } from '@/components/dashboard/WeatherWidget';
import { SearchBox } from '@/components/navigation/SearchBox';
import { CommandPalette } from '@/components/navigation/CommandPalette';
import { UserMenu } from '@/components/UserMenu';
import { SearchInterface } from '@/components/search/SearchInterface';

// Local type for MapBox search results
interface MapBoxSearchResult {
  coordinates: [number, number];
  place_name: string;
}

export default function RoutePlannerPage() {
  const [showRoutePanel, setShowRoutePanel] = useState(false);
  const [startLocation, setStartLocation] = useState<Location | null>(null);
  const [endLocation, setEndLocation] = useState<Location | null>(null);
  const [waypoints, setWaypoints] = useState<Location[]>([]);

  const handleLocationSelect = (result: GlobalSearchResult, type: 'start' | 'end' | 'waypoint') => {
    const location: Location = {
      coordinates: result.coordinates,
      address: result.name
    };

    switch (type) {
      case 'start':
        setStartLocation(location);
        break;
      case 'end':
        setEndLocation(location);
        break;
      case 'waypoint':
        setWaypoints([...waypoints, location]);
        break;
    }
  };

  const handleMapBoxResult = (result: MapBoxSearchResult) => {
    const searchResult: GlobalSearchResult = {
      id: result.place_name, // Using place_name as id since MapBox doesn't provide one
      name: result.place_name,
      coordinates: result.coordinates,
      type: 'location'
    };
    handleLocationSelect(searchResult, 'start');
  };

  return (
    <div className="route-planner grid grid-cols-[350px_1fr]">
      {/* Left Panel - Search & Tools */}
      <div className="route-planner__sidebar flex flex-col h-screen border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <UserMenu />
          <SearchBox 
            onSelect={handleMapBoxResult}
            placeholder="Search locations..."
          />
          <CommandPalette />
        </div>
        
        <div className="flex-1 overflow-auto">
          <SearchInterface
            onSearch={async (query) => {
              // Implement search logic
              return [];
            }}
            onSelect={(result) => handleLocationSelect(result, 'end')}
            onClear={() => {}}
            placeholder="Search destinations..."
          />
        </div>
      </div>

      {/* Right Panel - Map & Visualizations */}
      <div className="route-planner__map-container relative">
        <MapView
          center={[-104.9903, 39.7392]}
          zoom={12}
        />

        <div className="absolute top-4 left-4">
          <WeatherWidget />
        </div>
      </div>
    </div>
  );
} 