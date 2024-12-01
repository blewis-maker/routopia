'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import type { MapRef } from '@/components/Map';
import ChatWindow from '@/components/chat/ChatWindow';
import { SearchPanel } from '@/components/SearchPanel';
import { RoutePanel } from '@/components/RoutePanel';
import NavBar from '@/components/NavBar';

// Dynamically import Map component with no SSR
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
  const [startLocation, setStartLocation] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [showRoutePanel, setShowRoutePanel] = useState(false);

  const handleChatResponse = (message: string) => {
    mapRef.current?.showResponse(message);
  };

  const handleLocationSelect = (coords: [number, number]) => {
    console.log('Location selected:', coords);
  };

  const handleToolSelect = (tool: string) => {
    switch (tool) {
      case 'SEARCH':
        setShowSearchPanel(true);
        break;
      case 'ROUTE':
        setShowRoutePanel(true);
        break;
      // Add other tool handlers
    }
  };

  return (
    <div className="flex flex-col h-screen bg-stone-900">
      <NavBar />
      
      <main className="flex-1 flex relative mt-16"> {/* Add mt-16 to account for NavBar height */}
        {/* Left Chat Panel */}
        <div className="w-[350px] flex flex-col bg-stone-900 border-r border-stone-800">
          <ChatWindow
            onSendMessage={handleChatResponse}
            onDestinationChange={setDestination}
          />
        </div>

        {/* Center Map Container */}
        <div className="flex-1 relative">
          <ErrorBoundary>
            <Map 
              ref={mapRef}
              startLocation={null}
              endLocation={null}
              waypoints={[]}
              onLocationSelect={handleLocationSelect}
              onStartLocationChange={setStartLocation}
              onDestinationChange={setDestination}
            />
          </ErrorBoundary>

          {/* Floating Panels */}
          {showSearchPanel && (
            <SearchPanel
              onClose={() => setShowSearchPanel(false)}
              onLocationSelect={handleLocationSelect}
            />
          )}

          {showRoutePanel && (
            <RoutePanel
              onClose={() => setShowRoutePanel(false)}
              startLocation={null}
              endLocation={null}
              waypoints={[]}
              onStartLocationChange={(loc) => setStartLocation(loc.address)}
              onEndLocationChange={(loc) => setDestination(loc.address)}
              onWaypointAdd={() => {}}
            />
          )}
        </div>

        {/* Right Routes Panel */}
        <div className="w-[350px] flex flex-col bg-stone-900 border-l border-stone-800">
          <div className="p-4 border-b border-stone-800">
            <h2 className="text-white text-lg font-semibold">My Routes</h2>
          </div>
          <div className="flex-1 overflow-auto p-4">
            {/* Routes list will go here */}
          </div>
        </div>
      </main>
    </div>
  );
} 