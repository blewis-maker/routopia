'use client';

import dynamic from 'next/dynamic';
import { useState, useRef } from 'react';
import { UserAvatar } from '@/components/UserAvatar';
import Map from '@/components/Map';
import type { MapRef } from '@/components/Map';

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
  const mapRef = useRef<MapRef>(null);
  const [inputValue, setInputValue] = useState('');
  const [startLocation, setStartLocation] = useState<Location | null>(null);
  const [endLocation, setEndLocation] = useState<Location | null>(null);
  const [waypoints, setWaypoints] = useState<Location[]>([]);

  const handleChatSubmit = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      if (!inputValue.trim()) return;

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: inputValue }),
        });

        const data = await response.json();
        
        // Show response if we have a map reference
        if (mapRef.current) {
          mapRef.current.showResponse(data.message || inputValue);
        }

        setInputValue('');
      } catch (error) {
        if (mapRef.current) {
          mapRef.current.showResponse("I'm ready to help plan your route. What would you like to know?");
        }
      }
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] relative">
      {/* Left Sidebar - RouteGPT Test */}
      <div className="absolute left-0 top-0 bottom-0 w-64 bg-stone-900 border-r border-stone-800 z-10">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-white mb-4">RouteGPT Test</h2>
          <div className="mt-4">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleChatSubmit}
              className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none resize-none mb-4"
              placeholder="Enter your route planning question and press Enter..."
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Main Map Area */}
      <div className="absolute inset-0">
        <Map 
          ref={mapRef}
          startLocation={startLocation?.coordinates || null}
          endLocation={endLocation?.coordinates || null}
          waypoints={waypoints.map(wp => wp.coordinates)}
          onLocationSelect={(coords) => {
            // Handle location selection logic here
          }}
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