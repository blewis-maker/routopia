import React from 'react';
import type { Position } from 'geojson';
import type { RouteSegment, POICluster } from '../../../types/route.types';

interface RouteSidebarProps {
  mainRoute: RouteSegment;
  tributaries: RouteSegment[];
  poiClusters: POICluster[];
  onTributarySelect?: (index: number) => void;
  onPoiSelect?: (poi: POICluster) => void;
}

export const RouteSidebar: React.FC<RouteSidebarProps> = ({
  mainRoute,
  tributaries,
  poiClusters,
  onTributarySelect,
  onPoiSelect,
}) => {
  return (
    <div className="w-80 bg-white dark:bg-stone-800 h-full overflow-y-auto">
      {/* Main Route Summary */}
      <div className="p-4 border-b dark:border-stone-700">
        <h2 className="text-lg font-semibold mb-2">Main Route</h2>
        <div className="space-y-2 text-sm">
          <div>Distance: {calculateDistance(mainRoute.coordinates)}km</div>
          <div>Elevation: {mainRoute.elevation}m</div>
          <div>Flow Volume: {mainRoute.flowVolume || 'Normal'}</div>
        </div>
      </div>

      {/* Tributaries */}
      <div className="p-4 border-b dark:border-stone-700">
        <h2 className="text-lg font-semibold mb-2">Tributaries</h2>
        <div className="space-y-3">
          {tributaries.map((tributary, index) => (
            <button
              key={index}
              className="w-full text-left p-2 rounded hover:bg-stone-100 dark:hover:bg-stone-700 transition"
              onClick={() => onTributarySelect?.(index)}
            >
              <div className="font-medium">Tributary {index + 1}</div>
              <div className="text-sm text-stone-600 dark:text-stone-400">
                {tributary.flowVolume ? `Flow: ${tributary.flowVolume}` : 'Normal flow'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* POI Clusters */}
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-2">Points of Interest</h2>
        <div className="space-y-3">
          {poiClusters.map((cluster, index) => (
            <button
              key={index}
              className="w-full text-left p-2 rounded hover:bg-stone-100 dark:hover:bg-stone-700 transition"
              onClick={() => onPoiSelect?.(cluster)}
            >
              <div className="font-medium">{cluster.type}</div>
              <div className="text-sm text-stone-600 dark:text-stone-400">
                Density: {cluster.density}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper function to calculate distance
function calculateDistance(coordinates: Position[]): number {
  // Implementation of distance calculation
  return 0; // Placeholder
} 