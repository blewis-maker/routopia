'use client';

import { useRef, useState } from 'react';
import Map, { MapRef } from '@/components/Map';
import ChatWindow from '@/components/chat/ChatWindow';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const RoutopiaPage = () => {
  const mapRef = useRef<MapRef>(null);
  const [startLocation, setStartLocation] = useState<string>('');
  const [destination, setDestination] = useState<string>('');

  const handleChatResponse = (message: string) => {
    mapRef.current?.showResponse(message);
    // Here we could parse the message for destinations and update the destination input
  };

  const handleStartLocationChange = (location: string) => {
    setStartLocation(location);
    // Here we could add geocoding to convert the location to coordinates
  };

  const handleDestinationChange = (location: string) => {
    setDestination(location);
    // Here we could add geocoding to convert the location to coordinates
  };

  return (
    <div className="flex h-screen">
      {/* Left Chat Sidebar */}
      <div className="w-[350px] flex flex-col bg-[#1E1E1E] border-r border-gray-800">
        <ChatWindow onSendMessage={handleChatResponse} />
      </div>

      {/* Center Map Container */}
      <div className="flex-1 relative">
        <ErrorBoundary>
          <Map 
            ref={mapRef}
            startLocation={null}
            endLocation={null}
            waypoints={[]}
            onLocationSelect={() => {}}
            onStartLocationChange={handleStartLocationChange}
            onDestinationChange={handleDestinationChange}
          />
        </ErrorBoundary>
      </div>

      {/* Right Routes Sidebar */}
      <div className="w-[350px] flex flex-col bg-[#1E1E1E] border-l border-gray-800">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-white text-lg font-semibold">My Routes</h2>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {/* Routes list will go here */}
        </div>
      </div>
    </div>
  );
};

export default RoutopiaPage; 