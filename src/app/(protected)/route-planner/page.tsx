'use client';

import { useState } from 'react';
import { Route, RoutePreferences } from '@/types/route/types';
import { POIRecommendation } from '@/types/poi';
import { Location } from '@/types';
import { ActivityType } from '@/types/activity';
import { MapView } from '@/components/shared/MapView';
import { WeatherWidget } from '@/components/dashboard/WeatherWidget';
import { SearchBox } from '@/components/navigation/SearchBox';
import { CommandPalette } from '@/components/navigation/CommandPalette';
import ChatWindow from '@/components/chat/ChatWindow';
import { RouteSuggestion } from '@/components/chat/RouteSuggestion';
import { POISuggestion } from '@/components/chat/POISuggestion';
import { RouteInteraction } from '@/components/interactions/RouteInteraction';

// Local type for MapBox search results
interface MapBoxSearchResult {
  coordinates: [number, number];
  place_name: string;
}

export default function RoutePlannerPage() {
  // Core route state
  const [mainRoute, setMainRoute] = useState<Route | null>(null);
  const [tributaryRoutes, setTributaryRoutes] = useState<Route[]>([]);
  const [activePOI, setActivePOI] = useState<POIRecommendation | null>(null);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  
  // Route preferences
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

  // Chat and route state
  const [messages, setMessages] = useState<Array<{
    type: 'user' | 'assistant';
    content: string;
  }>>([{
    type: 'assistant',
    content: "Hi! I can help you plan routes based on activities. What would you like to do today?"
  }]);

  const handleChatMessage = async (message: string) => {
    // Add user message
    setMessages(prev => [...prev, { type: 'user', content: message }]);

    try {
      // Will integrate with AIService here
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, preferences })
      });

      const data = await response.json();
      
      // Add AI response
      setMessages(prev => [...prev, { type: 'assistant', content: data.message }]);
      
      // Update route if provided
      if (data.route) {
        setMainRoute(data.route);
      }

      // Update POIs if provided
      if (data.pois?.length) {
        setActivePOI(data.pois[0]);
      }

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: 'Sorry, I encountered an error processing your request.'
      }]);
    }
  };

  const handlePOISelect = async (poi: POIRecommendation) => {
    setActivePOI(poi);
    
    try {
      // Will integrate with RouteService to get tributary routes
      const response = await fetch('/api/routes/tributaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          poiId: poi.id,
          mainRoute,
          preferences 
        })
      });

      const data = await response.json();
      setTributaryRoutes(data.routes);
    } catch (error) {
      console.error('Failed to load tributary routes:', error);
    }
  };

  return (
    <div className="route-planner grid grid-cols-[400px_1fr]">
      {/* Left Panel - Chat & Tools */}
      <div className="route-planner__sidebar flex flex-col h-screen border-r border-gray-200 bg-stone-900">
        <div className="p-4 border-b border-stone-800">
          <SearchBox 
            onSelect={(result: MapBoxSearchResult) => {
              setUserLocation({
                coordinates: result.coordinates,
                address: result.place_name
              });
            }}
            placeholder="Set your starting point..."
          />
          <CommandPalette />
        </div>
        
        <div className="flex-1 overflow-auto">
          <ChatWindow
            onSendMessage={handleChatMessage}
            messages={messages}
          />
        </div>

        {activePOI && (
          <div className="p-4 border-t border-stone-800">
            <POISuggestion
              suggestions={[activePOI.name]}
              onSelect={() => handlePOISelect(activePOI)}
            />
            {mainRoute && (
              <RouteSuggestion
                route={{
                  startLocation: mainRoute.segments[0].startPoint.toString(),
                  endLocation: mainRoute.segments[mainRoute.segments.length - 1].endPoint.toString(),
                  distance: mainRoute.totalMetrics?.distance || 0,
                  duration: mainRoute.totalMetrics?.duration || 0,
                  routeType: mainRoute.preferences.activityType
                }}
              />
            )}
          </div>
        )}
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

        {mainRoute && (
          <div className="absolute bottom-4 left-4 right-4">
            <RouteInteraction
              points={mainRoute.segments.map(segment => ({
                type: 'waypoint',
                coordinates: [segment.startPoint.longitude, segment.startPoint.latitude],
                address: segment.startPoint.toString()
              }))}
              onPointDrag={(index, coordinates) => {
                // Will integrate with RouteService to update route
              }}
              onPointAdd={(point) => {
                // Will integrate with RouteService to add waypoint
              }}
              onPointRemove={(index) => {
                // Will integrate with RouteService to remove waypoint
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}