import React from 'react';
import { MapView } from '../shared/MapView';
import { RouteSidebar } from '../shared/RouteSidebar';
import { ChatInterface } from '../chat/ChatInterface';
import { MapToolbar } from '../map/MapToolbar';
import { MapLegend } from '../map/MapLegend';
import { POIMarkers } from '../map/POIMarkers';
import { RouteLayer } from '../map/RouteLayer';
import { useRouteCollaboration } from '@/hooks/useRouteCollaboration';
import { useMCPClient } from '@/hooks/useMCPClient';

interface RouteCreatorProps {
  sessionId: string;
  mode?: 'main' | 'edit';
  selectedTributaryId?: string;
  onModeChange?: (mode: 'main' | 'edit') => void;
  onTributaryConnect?: (tributaryId: string) => void;
}

export const RouteCreator: React.FC<RouteCreatorProps> = ({
  sessionId,
  mode = 'main',
  selectedTributaryId,
  onModeChange,
  onTributaryConnect,
}) => {
  const [selectedPOIId, setSelectedPOIId] = React.useState<string | undefined>();
  const [isLoading, setIsLoading] = React.useState(true);

  // Use existing hooks for MCP integration
  const mcpClient = useMCPClient();
  const {
    state: routeState,
    updateMainRoute,
    addTributary,
    updateTributary,
    addPOI,
    updateCursor,
    selectTributary,
  } = useRouteCollaboration(sessionId);

  // Ensure we have default values for the route state
  const defaultRouteState = {
    mainRoute: { coordinates: [], type: 'LineString' as const },
    tributaries: [],
    pois: [],
    activeUsers: []
  };

  const currentState = routeState || defaultRouteState;

  // Handle map interactions
  const handleTributaryHover = (tributaryId: string | null) => {
    if (tributaryId) {
      setSelectedTributaryId(tributaryId);
    }
  };

  const handleTributaryClick = (tributaryId: string) => {
    setSelectedTributaryId(tributaryId);
    selectTributary(tributaryId);
  };

  const handlePOIClick = (poiId: string) => {
    setSelectedPOIId(poiId);
  };

  const handleMapClick = (point: [number, number]) => {
    updateCursor(point);
  };

  React.useEffect(() => {
    if (routeState) {
      setIsLoading(false);
    }
  }, [routeState]);

  // Convert route state to component props with safe access
  const mapRoute = routeState?.mainRoute?.coordinates?.length > 0 ? {
    coordinates: routeState.mainRoute.coordinates,
    color: '#2563EB', // Primary blue for main river
    metadata: routeState.mainRoute.metadata
  } : undefined;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-stone-900">
        <div className="text-white">Loading route data...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Main Map Area */}
      <div className="relative flex-1">
        <MapView
          center={[-105.2705, 40.0150]} // Center on Boulder
          zoom={13}
          route={currentState.mainRoute}
          tributaries={currentState.tributaries}
          markers={(currentState.pois || []).map(poi => ({
            id: poi.id,
            position: poi.position,
            type: poi.type
          }))}
          interactive={true}
          loading={isLoading}
          onTributaryHover={handleTributaryHover}
          onTributaryClick={handleTributaryClick}
          onMarkerClick={handlePOIClick}
          onRouteClick={handleMapClick}
        />

        {/* Map Controls */}
        <div className="absolute top-4 right-4 z-10">
          <MapToolbar
            onLayerToggle={(layer) => console.log('Toggle layer:', layer)}
            onToolSelect={(tool) => console.log('Selected tool:', tool)}
          />
        </div>

        {/* Map Legend */}
        <div className="absolute top-4 left-4 z-10">
          <MapLegend
            items={[
              {
                color: '#2563EB',
                label: 'Main Route (Car)',
                type: 'route',
              },
              {
                color: '#10B981',
                label: 'Scenic Tributary',
                type: 'tributary',
              },
              {
                color: '#8B5CF6',
                label: 'Cultural Tributary',
                type: 'tributary',
              },
              {
                color: '#F59E0B',
                label: 'Activity Tributary',
                type: 'tributary',
              },
              {
                color: '#EF4444',
                label: 'Points of Interest',
                type: 'poi',
              },
            ]}
          />
        </div>

        {/* Active Users */}
        <div className="absolute bottom-4 left-4 z-10 flex space-x-2">
          {(routeState?.activeUsers || []).map(user => (
            <div
              key={user.id}
              className="bg-white rounded-full p-2 shadow-lg text-sm flex items-center space-x-2"
            >
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>{user.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-96 border-l border-gray-200">
        <RouteSidebar
          mainRoute={currentState.mainRoute}
          tributaries={currentState.tributaries}
          poiClusters={currentState.pois}
          onTributarySelect={handleTributaryClick}
        />
      </div>

      {/* Chat Interface */}
      <div className="absolute bottom-4 right-4 z-10 w-96">
        <ChatInterface
          onSuggestion={(suggestion) => {
            if (suggestion.type === 'TRIBUTARY') {
              addTributary(
                suggestion.coordinates,
                suggestion.connectionPoint,
                suggestion.activityType,
                suggestion.metadata
              );
            }
          }}
        />
      </div>
    </div>
  );
}; 