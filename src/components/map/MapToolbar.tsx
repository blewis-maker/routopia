import { GoogleMapsManager } from '@/services/maps/GoogleMapsManager';
import { MapIcon, Navigation, Layers, Car, X } from 'lucide-react';

interface MapToolbarProps {
  mapIntegration: GoogleMapsManager | null;
  onToolSelect: (tool: 'ROUTE' | 'SEARCH' | 'TRAFFIC' | 'LAYERS') => void;
  onPreferencesToggle: () => void;
  showPreferences: boolean;
  activeTools?: string[];
}

export function MapToolbar({ 
  mapIntegration,
  onToolSelect 
}: MapToolbarProps) {
  return (
    <div className="absolute top-4 right-4 z-10">
      <button
        onClick={() => onToolSelect('LAYERS')}
        className="p-2 bg-[#1B1B1B]/95 backdrop-blur-sm rounded-lg border border-stone-800/50 text-stone-400 hover:text-stone-200 transition-colors"
      >
        <Layers className="w-5 h-5" />
      </button>
    </div>
  );
} 