import { useState } from 'react';
import { HybridMapService } from '@/services/maps/HybridMapService';
import { SearchBox } from '@/components/SearchBox';
import { Location } from '@/types';
import { cn } from '@/lib/utils';

interface RouteManagerProps {
  mapService: HybridMapService;
  onRouteUpdate?: (route: any) => void;
}

export function RouteManager({ mapService, onRouteUpdate }: RouteManagerProps) {
  const [origin, setOrigin] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [waypoints, setWaypoints] = useState<Location[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleError = (error: Error) => {
    setError(error.message);
    // Clear error after 3 seconds
    setTimeout(() => setError(null), 3000);
  };

  return (
    <div className="absolute top-4 left-4 z-10 space-y-2 w-80">
      <SearchBox 
        placeholder="Choose starting point..."
        onSelect={setOrigin}
        onError={handleError}
      />
      
      <SearchBox 
        placeholder="Choose destination..."
        onSelect={setDestination}
        onError={handleError}
      />
      
      {waypoints.map((waypoint, index) => (
        <SearchBox 
          key={index}
          placeholder={`Waypoint ${index + 1}`}
          onSelect={(location) => {
            const newWaypoints = [...waypoints];
            newWaypoints[index] = location;
            setWaypoints(newWaypoints);
          }}
          onError={handleError}
        />
      ))}

      {error && (
        <div className={cn(
          "px-3 py-2",
          "text-sm",
          "text-red-400 bg-red-500/10",
          "rounded-lg border border-red-500/20"
        )}>
          {error}
        </div>
      )}

      <button 
        onClick={() => setWaypoints([...waypoints, null])}
        className={cn(
          "text-sm",
          "text-stone-300 hover:text-teal-500",
          "transition-colors"
        )}
      >
        + Add stop
      </button>
    </div>
  );
} 