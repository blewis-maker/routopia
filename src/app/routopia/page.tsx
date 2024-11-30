'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { UserAvatar } from '@/components/UserAvatar';

// Define the Location type
interface Location {
  coordinates: [number, number];
  address: string;
}

// Import Map with no SSR
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-stone-900">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
    </div>
  ),
});

export default function RoutopiaPage() {
  const [startLocation, setStartLocation] = useState<Location | null>(null);
  const [endLocation, setEndLocation] = useState<Location | null>(null);
  const [waypoints, setWaypoints] = useState<Location[]>([]);

  const handleLocationSelect = (location: Location, type: 'start' | 'end' | 'waypoint') => {
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

  const handlePlanRoute = () => {
    console.log('Planning route with:', { startLocation, endLocation, waypoints });
  };

  return (
    <div className="h-[calc(100vh-4rem)] relative">
      {/* Left Sidebar */}
      <div className="absolute left-0 top-0 bottom-0 w-64 bg-stone-900 border-r border-stone-800 z-10">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">My Routes</h2>
          {/* Route list will go here */}
        </div>
      </div>

      {/* Main Map Area */}
      <div className="absolute inset-0 ml-64">
        <Map 
          startLocation={startLocation}
          endLocation={endLocation}
          waypoints={waypoints}
          onLocationSelect={handleLocationSelect}
          onPlanRoute={handlePlanRoute}
        />
          
        {/* Floating Search Bar */}
        <div className="absolute top-4 left-4 right-4 max-w-2xl mx-auto z-10">
          <input
            type="text"
            placeholder="Search for a location..."
            className="w-full px-4 py-2 bg-stone-900/90 backdrop-blur-sm border border-stone-700 rounded-lg text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 z-10">
          <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-500 transition-colors">
            Create Route
          </button>
        </div>
      </div>
    </div>
  );
} 