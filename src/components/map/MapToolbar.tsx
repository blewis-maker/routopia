import { GoogleMapsManager } from '@/services/maps/GoogleMapsManager';
import { MapIcon, Navigation, Layers, Car, X } from 'lucide-react';

interface MapToolbarProps {
  mapIntegration: GoogleMapsManager | null;
  onToolSelect: (tool: 'ROUTE' | 'SEARCH' | 'TRAFFIC' | 'LAYERS') => void;
  onPreferencesToggle: () => void;
  showPreferences: boolean;
  activeTools?: string[];
}

export const MapToolbar: React.FC<MapToolbarProps> = ({
  mapIntegration,
  onToolSelect,
  onPreferencesToggle,
  showPreferences,
  activeTools = []
}) => {
  return (
    <div className="absolute top-4 right-4 bg-stone-900/75 backdrop-blur-sm p-2 rounded-lg shadow-lg">
      <div className="flex gap-2">
        <button
          onClick={() => onToolSelect('ROUTE')}
          className={`p-2 rounded text-stone-100 transition-colors ${
            activeTools.includes('ROUTE') 
              ? 'bg-emerald-600 hover:bg-emerald-700' 
              : 'hover:bg-stone-700'
          }`}
          title="Plan Route"
        >
          <Navigation className="w-5 h-5" />
        </button>
        <button
          onClick={() => onToolSelect('SEARCH')}
          className={`p-2 rounded text-stone-100 transition-colors ${
            activeTools.includes('SEARCH')
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : 'hover:bg-stone-700'
          }`}
          title="Search Places"
        >
          <MapIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => {
            mapIntegration?.setTrafficLayer(!activeTools.includes('TRAFFIC'));
            onToolSelect('TRAFFIC');
          }}
          className={`p-2 rounded text-stone-100 transition-colors ${
            activeTools.includes('TRAFFIC')
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : 'hover:bg-stone-700'
          }`}
          title="Traffic Layer"
        >
          <Car className="w-5 h-5" />
        </button>
        <button
          onClick={() => onToolSelect('LAYERS')}
          className={`p-2 rounded text-stone-100 transition-colors ${
            activeTools.includes('LAYERS')
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : 'hover:bg-stone-700'
          }`}
          title="Map Layers"
        >
          <Layers className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}; 