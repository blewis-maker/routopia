import { GoogleMapsManager } from '@/services/maps/GoogleMapsManager';
import { Sun, Moon, Satellite } from 'lucide-react';
import { useState } from 'react';

interface MapToolbarProps {
  mapIntegration: GoogleMapsManager | null;
  onToolSelect: (tool: 'ROUTE' | 'SEARCH' | 'TRAFFIC') => void;
  onPreferencesToggle: () => void;
  showPreferences: boolean;
  activeTools?: string[];
}

export function MapToolbar({ 
  mapIntegration,
  onToolSelect 
}: MapToolbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIcon, setActiveIcon] = useState<'light' | 'dark' | 'satellite'>('light');

  const handleMapTypeChange = (mapType: string) => {
    const map = mapIntegration?.getMap();
    if (!map) return;
    
    map.setMapTypeId(mapType);
    
    // Update the active icon
    if (mapType === google.maps.MapTypeId.ROADMAP) {
      setActiveIcon('light');
    } else if (mapType === 'dark_mode') {
      setActiveIcon('dark');
    } else if (mapType === google.maps.MapTypeId.HYBRID) {
      setActiveIcon('satellite');
    }
    
    setIsOpen(false);
  };

  const renderActiveIcon = () => {
    switch (activeIcon) {
      case 'dark':
        return <Moon className="w-5 h-5" />;
      case 'satellite':
        return <Satellite className="w-5 h-5" />;
      default:
        return <Sun className="w-5 h-5" />;
    }
  };

  return (
    <div className="absolute top-4 right-4 z-10">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-[#1B1B1B]/95 backdrop-blur-sm rounded-lg border border-stone-800/50 text-stone-400 hover:text-stone-200 transition-colors"
        >
          {renderActiveIcon()}
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-2 bg-[#1B1B1B]/95 backdrop-blur-sm rounded-lg border border-stone-800/50 overflow-hidden flex flex-col gap-1 p-1">
            <button
              onClick={() => handleMapTypeChange(google.maps.MapTypeId.ROADMAP)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-stone-400 hover:bg-stone-800/50 hover:text-stone-200 rounded-md"
            >
              <Sun className="w-4 h-4" />
              <span>Light</span>
            </button>
            <button
              onClick={() => handleMapTypeChange('dark_mode')}
              className="flex items-center gap-2 px-3 py-2 text-sm text-stone-400 hover:bg-stone-800/50 hover:text-stone-200 rounded-md"
            >
              <Moon className="w-4 h-4" />
              <span>Dark</span>
            </button>
            <button
              onClick={() => handleMapTypeChange(google.maps.MapTypeId.HYBRID)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-stone-400 hover:bg-stone-800/50 hover:text-stone-200 rounded-md"
            >
              <Satellite className="w-4 h-4" />
              <span>Satellite</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 