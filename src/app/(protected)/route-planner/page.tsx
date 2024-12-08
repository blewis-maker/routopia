'use client';

import { useState, useRef, useEffect } from 'react';
import { Route, RoutePreferences } from '@/types/route/types';
import { Location } from '@/types';
import { ActivityType } from '@/types/activity';
import { MapView } from '@/components/shared/MapView';
import { WeatherWidget } from '@/components/dashboard/WeatherWidget';
import { SearchBox } from '@/components/navigation/SearchBox';
import ChatWindow from '@/components/chat/ChatWindow';
import Image from 'next/image';

interface WeatherInfo {
  location: string;
  coordinates: [number, number];
}

export default function RoutePlannerPage() {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [mainRoute, setMainRoute] = useState<Route | null>(null);
  const [tributaryRoutes, setTributaryRoutes] = useState<Route[]>([]);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [weatherInfo, setWeatherInfo] = useState<WeatherInfo | null>(null);
  
  const [preferences, setPreferences] = useState<RoutePreferences>({
    activityType: 'WALK',
    weights: {
      distance: 1,
      duration: 1,
      effort: 1,
      safety: 1,
      comfort: 1
    }
  });

  const [messages, setMessages] = useState<Array<{
    type: 'user' | 'assistant';
    content: string;
  }>>([{
    type: 'assistant',
    content: "I'm here to help you plan routes in Colorado. Where would you like to go?"
  }]);

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleChatMessage = async (message: string) => {
    try {
      setMessages(prev => [...prev, { type: 'user', content: message }]);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          preferences,
          userLocation
        })
      });

      const data = await response.json();
      
      setMessages(prev => [...prev, { 
        type: 'assistant', 
        content: data.message 
      }]);

      if (data.route) {
        setMainRoute(data.route);
        const endPoint = data.route.segments[data.route.segments.length - 1].endPoint;
        setWeatherInfo({
          location: data.route.name,
          coordinates: [endPoint.longitude, endPoint.latitude]
        });
      }

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: 'Sorry, I encountered an error processing your request.'
      }]);
    }
  };

  return (
    <div className="grid grid-cols-[400px_1fr] h-screen">
      {/* Left Panel - Chat Interface */}
      <div className="flex flex-col h-full bg-stone-900 border-r border-stone-800">
        <div className="p-4 border-b border-stone-800">
          <Image
            src="/routopia-logo.png"
            alt="Routopia"
            width={120}
            height={30}
            className="mb-2"
          />
        </div>
        
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-stone-700 scrollbar-track-transparent"
        >
          <ChatWindow
            onSendMessage={handleChatMessage}
            onDestinationChange={(destination) => {
              console.log('Destination changed:', destination);
            }}
          />
        </div>
      </div>

      {/* Right Panel - Map & Controls */}
      <div className="relative h-full">
        {/* Search Box Overlay */}
        <div className="absolute top-4 left-4 z-10 w-96">
          <SearchBox 
            onSelect={(result) => {
              if ('coordinates' in result && 'place_name' in result) {
                setUserLocation({
                  coordinates: result.coordinates,
                  address: result.place_name
                });
                setWeatherInfo({
                  location: result.place_name,
                  coordinates: result.coordinates
                });
              }
            }}
            placeholder="Set your starting point..."
          />
        </div>

        <MapView
          center={[-104.9903, 39.7392]}
          zoom={12}
        />

        {/* Weather Overlay */}
        {weatherInfo && (
          <div className="absolute top-4 right-4 transition-all duration-300 ease-in-out">
            <div className="bg-stone-900/90 rounded-lg p-2 backdrop-blur">
              <div className="text-sm text-stone-400 mb-1">{weatherInfo.location}</div>
              <WeatherWidget />
            </div>
          </div>
        )}

        {/* Route Information Overlay */}
        {mainRoute && (
          <div className="absolute bottom-4 left-4 right-4 bg-stone-900/90 rounded-lg backdrop-blur">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white mb-2">Current Route</h3>
              <div className="text-stone-300">
                <p>Distance: {Math.round(mainRoute.totalMetrics?.distance || 0)}km</p>
                <p>Duration: {Math.round((mainRoute.totalMetrics?.duration || 0) / 60)} minutes</p>
                <p>Activity: {mainRoute.preferences.activityType}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}