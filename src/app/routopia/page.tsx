'use client';

import { useRef } from 'react';
import Map, { MapRef } from '@/components/Map';
import ChatWindow from '@/components/chat/ChatWindow';

const RoutopiaPage = () => {
  const mapRef = useRef<MapRef>(null);

  const handleChatResponse = (message: string) => {
    // Show response on map
    mapRef.current?.showResponse(message);
  };

  return (
    <div className="flex h-screen">
      {/* Chat Sidebar */}
      <div className="w-[400px] flex flex-col bg-[#1E1E1E] border-r border-gray-800">
        <ChatWindow onSendMessage={handleChatResponse} />
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <div className="absolute inset-0">
          <Map ref={mapRef} />
        </div>
      </div>
    </div>
  );
};

export default RoutopiaPage; 