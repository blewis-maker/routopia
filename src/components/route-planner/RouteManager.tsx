import { useState } from 'react';
import { HybridMapService } from '@/services/maps/HybridMapService';
import { SearchBox } from '@/components/SearchBox';
import { Location } from '@/types';

interface RouteManagerProps {
  mapService: HybridMapService;
  onRouteUpdate?: (route: any) => void;
}

export function RouteManager({ mapService, onRouteUpdate }: RouteManagerProps) {
  const [origin, setOrigin] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [waypoints, setWaypoints] = useState<Location[]>([]);

  const handleOriginSelect = async (location: Location) => {
    setOrigin(location);
    await updateRoute();
  };

  const handleDestinationSelect = async (location: Location) => {
    setDestination(location);
    await updateRoute();
  };

  const addWaypoint = () => {
    setWaypoints([...waypoints, null]);
  };

  const updateRoute = async () => {
    if (!origin || !destination) return;
    
    // Call your map service to calculate and draw route
    const route = await mapService.calculateRoute({
      origin,
      destination,
      waypoints: waypoints.filter(Boolean)
    });

    // Update markers and path
    mapService.updateRouteVisualization(route);
    
    onRouteUpdate?.(route);
  };

  return (
    <div className="absolute top-4 left-4 z-10 space-y-2">
      <SearchBox 
        placeholder="Choose starting point..."
        onSelect={handleOriginSelect}
      />
      <SearchBox 
        placeholder="Choose destination..."
        onSelect={handleDestinationSelect}
      />
      {waypoints.map((waypoint, index) => (
        <SearchBox 
          key={index}
          placeholder={`Waypoint ${index + 1}`}
          onSelect={(location) => {
            const newWaypoints = [...waypoints];
            newWaypoints[index] = location;
            setWaypoints(newWaypoints);
            updateRoute();
          }}
        />
      ))}
      <button 
        onClick={addWaypoint}
        className="text-sm text-stone-300 hover:text-stone-200"
      >
        + Add stop
      </button>
    </div>
  );
} 