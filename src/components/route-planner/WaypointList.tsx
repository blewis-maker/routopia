import { Waypoint } from '@/types';
import { GripVertical, X } from 'lucide-react';

interface WaypointListProps {
  waypoints: Waypoint[];
  onRemoveWaypoint: (index: number) => void;
  onReorderWaypoints: (from: number, to: number) => void;
}

export function WaypointList({
  waypoints,
  onRemoveWaypoint,
  onReorderWaypoints
}: WaypointListProps) {
  return (
    <div className="space-y-2">
      {waypoints.map((waypoint, index) => (
        <div
          key={`${waypoint.address}-${index}`}
          className="flex items-center gap-2 px-3 py-2 bg-stone-800/50 rounded-lg"
        >
          <button className="text-stone-400 hover:text-stone-300">
            <GripVertical className="w-4 h-4" />
          </button>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm text-stone-200 truncate">
              {waypoint.address}
            </p>
          </div>
          
          <button
            onClick={() => onRemoveWaypoint(index)}
            className="text-stone-400 hover:text-stone-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
} 