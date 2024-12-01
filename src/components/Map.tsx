'use client';

import { useEffect, useRef, useState, forwardRef } from 'react';
import { MapIntegrationLayer } from '@/services/maps/MapIntegrationLayer';
import { RouteProcessor } from '@/services/routing/RouteProcessor';
import { SearchBox } from '@/components/SearchBox';
import { SearchPanel } from '@/components/SearchPanel';
import { MapToolbar } from '@/components/map/MapToolbar';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { RoutePanel } from '@/components/RoutePanel';
import ChatInput from '@/components/chat/ChatInput';
import { WeatherOverlay } from './display/WeatherOverlay';
import { ElevationProfile } from './display/ElevationProfile';
import { TrafficVisualization } from './display/TrafficVisualization';
import { ActivitySelector } from './controls/ActivitySelector';
import { SettingsMenu } from './controls/SettingsMenu';
import { NotificationSystem } from './feedback/NotificationSystem';
import { EnhancedSearchBox } from './search/EnhancedSearchBox';
import { SettingsIcon } from '@/components/icons/SettingsIcon';
import type { ActivityType } from '@/types/routes';

interface MapProps {
  startLocation: [number, number] | null;
  endLocation: [number, number] | null;
  waypoints: [number, number][];
  onLocationSelect: (coords: [number, number]) => void;
  onStartLocationChange?: (location: string) => void;
  onDestinationChange?: (location: string) => void;
  settings?: {
    map: MapSettings;
    display: DisplaySettings;
    notifications: NotificationSettings;
  };
  onSettingsChange?: (settings: any) => void;
}

export interface MapRef {
  showResponse: (response: string) => void;
  getCurrentLocation: () => { lat: number; lng: number } | null;
}

const Map = forwardRef<MapRef, MapProps>((props, ref) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapIntegration = useRef<MapIntegrationLayer | null>(null);
  const routeProcessor = useRef<RouteProcessor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const currentLocation = useRef<{ lat: number; lng: number } | null>(null);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [showRoutePanel, setShowRoutePanel] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{
    type: 'user' | 'assistant';
    content: string;
  }>>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityType>('car');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [trafficData, setTrafficData] = useState<TrafficData | null>(null);

  // Initialize map
  useEffect(() => {
    let isMounted = true;

    const initializeMap = async () => {
      try {
        if (!mapContainer.current || mapIntegration.current) return;

        // Create and initialize map integration
        const mapInstance = new MapIntegrationLayer('map-container');
        await mapInstance.initialize();
        
        if (!isMounted) return;
        mapIntegration.current = mapInstance;

        // Initialize route processor
        routeProcessor.current = new RouteProcessor(
          mapInstance.getActiveProviderName(),
          process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''
        );

        setIsLoading(false);
      } catch (error) {
        console.error('Map initialization error:', error);
        setIsLoading(false);
      }
    };

    initializeMap();
    return () => { isMounted = false; };
  }, []);

  // Handle tool selection
  const handleToolSelect = (tool: string) => {
    if (!mapIntegration.current) return;

    switch (tool) {
      case 'ROUTE':
        setShowRoutePanel(true);
        break;
      case 'SEARCH':
        setShowSearchPanel(true);
        break;
      case 'TRAFFIC':
        mapIntegration.current.setTrafficLayer(true);
        break;
      case 'LAYERS':
        // Handle layers toggle
        break;
      default:
        console.warn('Unknown tool selected:', tool);
    }
  };

  const handleChatMessage = async (message: string) => {
    if (!mapIntegration.current) return;

    try {
      setChatMessages(prev => [...prev, { type: 'user', content: message }]);
      
      // Process message with RouteGPT
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          location: currentLocation.current,
          mapState: mapIntegration.current.getState()
        })
      });

      const data = await response.json();
      setChatMessages(prev => [...prev, { type: 'assistant', content: data.message }]);

      // Handle any map updates from the response
      if (data.mapAction) {
        await mapIntegration.current.handleChatAction(data.mapAction);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [...prev, {
        type: 'assistant',
        content: 'Sorry, I encountered an error processing your request.'
      }]);
    }
  };

  return (
    <div className="relative h-full w-full">
      <div id="map-container" ref={mapContainer} className="absolute inset-0" />
      
      {!isLoading && mapIntegration.current && (
        <>
          <MapToolbar
            mapIntegration={mapIntegration.current}
            onToolSelect={handleToolSelect}
          />

          <div className="absolute top-4 left-4 z-10">
            <EnhancedSearchBox
              onSearch={handleSearch}
              onSelect={handleSearchSelect}
              activityType={selectedActivity}
              placeholder="Search locations..."
            />
          </div>

          <div className="absolute top-4 right-4 z-10 flex items-center gap-4">
            <ActivitySelector
              selectedActivity={selectedActivity}
              onActivityChange={setSelectedActivity}
            />
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 bg-stone-800 rounded-lg text-white hover:bg-stone-700"
            >
              <SettingsIcon />
            </button>
          </div>

          {showSettings && (
            <div className="absolute top-20 right-4 z-20">
              <SettingsMenu
                settings={props.settings}
                onSettingsChange={props.onSettingsChange}
              />
            </div>
          )}

          <WeatherOverlay
            coordinates={currentLocation.current 
              ? [currentLocation.current.lat, currentLocation.current.lng]
              : [0, 0]
            }
            onWeatherUpdate={handleWeatherUpdate}
          />

          {props.startLocation && props.endLocation && (
            <>
              <div className="absolute bottom-4 left-4 z-10">
                <ElevationProfile
                  elevationData={routeData?.elevation || []}
                  activityType={selectedActivity}
                  onHover={handleElevationHover}
                />
              </div>

              <div className="absolute bottom-4 right-4 z-10">
                <TrafficVisualization
                  routeGeometry={routeData?.geometry || []}
                  onTrafficUpdate={handleTrafficUpdate}
                />
              </div>
            </>
          )}

          <NotificationSystem settings={props.settings?.notifications} />

          <div className="absolute left-4 top-4 bottom-4 w-[350px] bg-stone-900/90 backdrop-blur-sm rounded-lg overflow-hidden">
            <ChatWindow
              messages={chatMessages}
              onSendMessage={handleChatMessage}
              onDestinationChange={props.onDestinationChange}
            />
          </div>

          {showRoutePanel && (
            <RoutePanel
              onClose={() => setShowRoutePanel(false)}
              startLocation={props.startLocation}
              endLocation={props.endLocation}
              waypoints={props.waypoints}
              onStartLocationChange={handleStartLocationChange}
              onEndLocationChange={handleEndLocationChange}
              onWaypointAdd={handleWaypointAdd}
            />
          )}
        </>
      )}
    </div>
  );
});

Map.displayName = 'Map';
export default Map;
