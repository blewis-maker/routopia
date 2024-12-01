import { MapIntegrationLayer } from '@/services/maps/MapIntegrationLayer';
import { MapIcon, Navigation, Layers, Car } from 'lucide-react';

interface MapToolbarProps {
  mapIntegration: MapIntegrationLayer;
  onToolSelect: (tool: 'ROUTE' | 'SEARCH' | 'TRAFFIC' | 'LAYERS') => void;
}

export function MapToolbar({ mapIntegration, onToolSelect }: MapToolbarProps) {
  return (
    <div className="absolute top-4 right-4 bg-stone-900/75 backdrop-blur-sm p-2 rounded-lg shadow-lg">
      <div className="flex gap-2">
        <button
          onClick={() => onToolSelect('ROUTE')}
          className="p-2 hover:bg-stone-700 rounded text-stone-100"
          title="Plan Route"
        >
          <Navigation className="w-5 h-5" />
        </button>
        <button
          onClick={() => onToolSelect('SEARCH')}
          className="p-2 hover:bg-stone-700 rounded text-stone-100"
          title="Search Places"
        >
          <MapIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => {
            mapIntegration.setTrafficLayer(true);
            onToolSelect('TRAFFIC');
          }}
          className="p-2 hover:bg-stone-700 rounded text-stone-100"
          title="Traffic Layer"
        >
          <Car className="w-5 h-5" />
        </button>
        <button
          onClick={() => onToolSelect('LAYERS')}
          className="p-2 hover:bg-stone-700 rounded text-stone-100"
          title="Map Layers"
        >
          <Layers className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
} 