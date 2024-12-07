import React from 'react';
import { ChevronRightIcon, MapPinIcon } from '@heroicons/react/24/outline';

interface POI {
  id: string;
  name: string;
  type: string;
  description?: string;
}

interface Tributary {
  id: string;
  name: string;
  type: 'scenic' | 'cultural' | 'activity';
  pois: POI[];
  description?: string;
}

interface RouteVisualizationProps {
  routeName: string;
  routeDescription?: string;
  tributaries: Tributary[];
  onTributarySelect: (tributaryId: string) => void;
  onPOISelect: (poiId: string) => void;
  selectedTributaryId?: string;
}

export const RouteVisualization: React.FC<RouteVisualizationProps> = ({
  routeName,
  routeDescription,
  tributaries,
  onTributarySelect,
  onPOISelect,
  selectedTributaryId,
}) => {
  return (
    <div className="w-80 bg-gray-900 text-white h-full overflow-y-auto">
      {/* Main Route Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold">{routeName}</h2>
        {routeDescription && (
          <p className="text-gray-400 mt-2 text-sm">{routeDescription}</p>
        )}
      </div>

      {/* Tributaries List */}
      <div className="divide-y divide-gray-700">
        {tributaries.map((tributary) => (
          <div
            key={tributary.id}
            className={`${
              selectedTributaryId === tributary.id
                ? 'bg-gray-800'
                : 'hover:bg-gray-800/50'
            } transition-colors`}
          >
            {/* Tributary Header */}
            <button
              onClick={() => onTributarySelect(tributary.id)}
              className="w-full text-left p-4 flex items-center justify-between"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getTributaryColor(tributary.type) }}
                  />
                  <span className="font-medium">{tributary.name}</span>
                </div>
                {tributary.description && (
                  <p className="text-sm text-gray-400 mt-1">
                    {tributary.description}
                  </p>
                )}
              </div>
              <ChevronRightIcon
                className={`w-5 h-5 transition-transform ${
                  selectedTributaryId === tributary.id ? 'rotate-90' : ''
                }`}
              />
            </button>

            {/* POIs List */}
            {selectedTributaryId === tributary.id && tributary.pois.length > 0 && (
              <div className="bg-gray-800/50 px-4 pb-4">
                <div className="space-y-2">
                  {tributary.pois.map((poi) => (
                    <button
                      key={poi.id}
                      onClick={() => onPOISelect(poi.id)}
                      className="w-full flex items-start space-x-3 p-2 rounded hover:bg-gray-700/50 transition-colors"
                    >
                      <MapPinIcon className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div className="text-left">
                        <div className="font-medium">{poi.name}</div>
                        {poi.description && (
                          <p className="text-sm text-gray-400">
                            {poi.description}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Utility function for consistent colors (matching MapView)
function getTributaryColor(type: string): string {
  switch (type) {
    case 'scenic':
      return '#10B981'; // Green
    case 'cultural':
      return '#8B5CF6'; // Purple
    case 'activity':
      return '#F59E0B'; // Orange
    default:
      return '#6B7280'; // Gray
  }
} 