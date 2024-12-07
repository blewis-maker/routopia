import React from 'react';
import { NavigationBar } from '../layout/NavigationBar';
import { MapView } from '../shared/MapView';
import { AIChat } from '../shared/AIChat';
import { WeatherWidget } from '../shared/WeatherWidget';
import { ActivityTracker } from '../shared/ActivityTracker';

interface RoutePoint {
  lat: number;
  lng: number;
  elevation?: number;
}

interface Route {
  id: string;
  name: string;
  type: string;
  difficulty: string;
  distance: number;
  elevation: number;
  duration: number;
  coordinates: RoutePoint[];
}

interface Props {
  route?: Route;
  loading?: boolean;
  error?: Error;
}

export const MainApplicationView: React.FC<Props> = ({ route, loading, error }) => {
  const [messages] = React.useState([
    { role: 'assistant' as const, content: "I'm here to help you plan routes in Colorado. Where would you like to go?" }
  ]);

  const mapCenter = route?.coordinates?.[0] 
    ? [route.coordinates[0].lng, route.coordinates[0].lat] as [number, number]
    : [-104.9903, 39.7392] as [number, number]; // Default to Denver

  const mapMarkers = route?.coordinates?.map(coord => ({
    id: `${coord.lat}-${coord.lng}`,
    position: [coord.lng, coord.lat] as [number, number],
    label: ''
  })) || [];

  const mapRoute = route?.coordinates ? {
    coordinates: route.coordinates.map(coord => [coord.lng, coord.lat] as [number, number]),
    color: '#10B981'
  } : undefined;

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <NavigationBar />

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Sidebar - Route Planning & AI Chat */}
        <aside className="w-96 border-r border-neutral-200 dark:border-neutral-800 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            <AIChat messages={messages} />
          </div>
        </aside>

        {/* Main Content - Map & Route Visualization */}
        <main className="flex-1 flex flex-col">
          {loading ? (
            <div className="animate-pulse h-full">
              <div className="h-full bg-neutral-100 dark:bg-neutral-800 rounded-lg" />
            </div>
          ) : (
            <div className="relative h-full">
              <MapView
                center={mapCenter}
                zoom={12}
                markers={mapMarkers}
                route={mapRoute}
              />
              
              {/* Weather Widget Overlay */}
              <div className="absolute top-4 right-4 z-10">
                <WeatherWidget />
              </div>
            </div>
          )}
        </main>

        {/* Right Sidebar - Activity Tracking */}
        <aside className="w-96 border-l border-neutral-200 dark:border-neutral-800">
          <div className="h-full p-4">
            <ActivityTracker />
          </div>
        </aside>
      </div>

      {error && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-3 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error.message}</p>
        </div>
      )}
    </div>
  );
}; 