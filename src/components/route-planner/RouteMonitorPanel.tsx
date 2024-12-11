import { useEffect, useState } from 'react';
import { Route } from '@/types/route/types';
import { MapVisualization } from '@/types/maps/visualization';
import { convertRouteToVisualization } from '@/lib/utils/routeConversion';
import { formatDistance, formatDuration } from '@/lib/utils/formatters';

interface RouteMonitorPanelProps {
  route: Route;
  onAlert?: (message: string) => void;
}

export function RouteMonitorPanel({ route, onAlert }: RouteMonitorPanelProps) {
  const [visualization, setVisualization] = useState<MapVisualization | null>(null);

  useEffect(() => {
    if (!route) return;
    
    try {
      const viz = convertRouteToVisualization(route);
      setVisualization(viz);
    } catch (error) {
      console.error('Failed to convert route:', error);
      onAlert?.('Failed to process route visualization');
    }
  }, [route, onAlert]);

  if (!visualization || !route) return null;

  return (
    <div className="bg-[#1B1B1B]/95 backdrop-blur-sm rounded-lg border border-stone-800/50 p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-stone-200">Route Details</h3>
          <span className="text-xs text-stone-400">
            {route.metadata.difficulty}
          </span>
        </div>
        
        <div className="space-y-2">
          <div className="text-xs text-stone-400">
            <div>Distance: {formatDistance(route.metrics.distance)}</div>
            <div>Duration: {formatDuration(route.metrics.duration)}</div>
            <div>Terrain: {route.metadata.terrain.join(', ')}</div>
          </div>
        </div>

        {route.metadata.recommendations && route.metadata.recommendations.length > 0 && (
          <div className="space-y-1">
            <h4 className="text-xs font-medium text-stone-300">Recommendations</h4>
            <ul className="text-xs text-stone-400 space-y-1">
              {route.metadata.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 