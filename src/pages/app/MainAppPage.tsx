import React from 'react';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { MapView } from '@/components/map/MapView';
import { RoutePanel } from '@/components/route/RoutePanel';
import { useMainApplicationStore } from '@/store/app/mainApplication.store';

export default function MainAppPage() {
  const store = useMainApplicationStore();
  const { leftPanelOpen, rightPanelOpen } = store.layout;

  return (
    <div className="app-layout">
      {/* Left Panel - Chat Interface */}
      <div className={`left-panel ${leftPanelOpen ? 'open' : 'closed'}`}>
        <ChatInterface
          features={{
            messageHistory: true,
            routeGPT: true,
            locationSuggestions: true
          }}
        />
      </div>

      {/* Center Panel - Map View */}
      <div className="center-panel">
        <MapView
          overlays={[
            'RouteLayer',
            'POIMarkers',
            'WeatherInfo'
          ]}
        />
      </div>

      {/* Right Panel - Route Panel */}
      <div className={`right-panel ${rightPanelOpen ? 'open' : 'closed'}`}>
        <RoutePanel
          features={[
            'RouteDetails',
            'ActivityMetrics',
            'Waypoints'
          ]}
        />
      </div>
    </div>
  );
} 