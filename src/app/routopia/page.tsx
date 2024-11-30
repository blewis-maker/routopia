'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { UserAvatar } from '@/components/UserAvatar';
import GPTTest from '@/components/ai/GPTTest';

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

  return (
    <div className="h-[calc(100vh-4rem)] relative">
      {/* Left Sidebar - RouteGPT Test */}
      <div className="absolute left-0 top-0 bottom-0 w-64 bg-stone-900 border-r border-stone-800 z-10">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-white mb-4">RouteGPT Test</h2>
          <div className="mt-4">
            <GPTTest />
          </div>
        </div>
      </div>

      {/* Main Map Area */}
      <div className="absolute inset-0">
        <Map 
          startLocation={startLocation}
          endLocation={endLocation}
          waypoints={waypoints}
          onLocationSelect={handleLocationSelect}
        />
      </div>

      {/* Right Sidebar - My Routes */}
      <div className="absolute right-0 top-0 bottom-0 w-64 bg-stone-900 border-l border-stone-800 z-10">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-white mb-4">My Routes</h2>
          {/* Route list will go here */}
        </div>
      </div>

      {/* Floating Search Bar - Adjusted position and width */}
      <div className="absolute top-4 left-72 z-10">
        <input
          type="text"
          placeholder="Search for a location..."
          className="w-96 px-4 py-2 bg-stone-900/90 backdrop-blur-sm border border-stone-700 rounded-lg text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>
    </div>
  );
} 