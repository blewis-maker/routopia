import React from 'react';
import type { Tributary } from '../MapView';

interface RouteSidebarProps {
  routeName: string;
  routeDescription?: string;
  mainRoute: {
    coordinates: [number, number][];
    metadata: {
      type: string;
      distance: number;
      duration: number;
      trafficLevel: string;
      safety: string;
    };
  };
  tributaries: Tributary[];
  selectedTributaryId?: string;
  onTributarySelect: (id: string) => void;
}

export const RouteSidebar: React.FC<RouteSidebarProps> = ({
  routeName,
  routeDescription,
  mainRoute,
  tributaries,
  selectedTributaryId,
  onTributarySelect,
}) => {
  return (
    <div className="w-80 bg-white shadow-lg h-full overflow-auto">
      {/* Main Route Section */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">{routeName}</h2>
        {routeDescription && (
          <p className="mt-1 text-sm text-gray-600">{routeDescription}</p>
        )}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <p className="text-sm text-gray-500">Distance</p>
            <p className="font-medium">{mainRoute.metadata.distance} km</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Duration</p>
            <p className="font-medium">{mainRoute.metadata.duration} min</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Traffic</p>
            <p className="font-medium capitalize">{mainRoute.metadata.trafficLevel}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Safety</p>
            <p className="font-medium capitalize">{mainRoute.metadata.safety}</p>
          </div>
        </div>
      </div>

      {/* Tributaries Section */}
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Tributaries</h3>
        <div className="space-y-3">
          {tributaries.map((tributary) => (
            <button
              key={tributary.id}
              onClick={() => onTributarySelect(tributary.id)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                selectedTributaryId === tributary.id
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
              } border`}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">{tributary.name}</h4>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    tributary.type === 'scenic'
                      ? 'bg-green-100 text-green-800'
                      : tributary.type === 'cultural'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {tributary.type}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600">{tributary.description}</p>
              {tributary.metadata && (
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Activity: </span>
                    <span className="font-medium">{tributary.metadata.activityType}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Difficulty: </span>
                    <span className="font-medium">{tributary.metadata.difficulty}</span>
                  </div>
                  {tributary.metadata.elevation && (
                    <div>
                      <span className="text-gray-500">Elevation: </span>
                      <span className="font-medium">{tributary.metadata.elevation}m</span>
                    </div>
                  )}
                  {tributary.metadata.weather && (
                    <div>
                      <span className="text-gray-500">Weather: </span>
                      <span className="font-medium">
                        {tributary.metadata.weather.temperature}°F, {tributary.metadata.weather.condition}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}; 