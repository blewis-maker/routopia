import { GoogleMapsManager } from '@/services/maps/GoogleMapsManager';
import { Sun, Moon, Satellite, Layers } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

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
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMapTypeChange = (mapType: string) => {
    const map = mapIntegration?.getMap();
    if (!map) {
      console.error('Map not initialized');
      return;
    }
    
    console.log('Changing map type to:', mapType); // Debug log

    try {
      switch (mapType) {
        case 'dark_mode':
          map.setMapTypeId('dark_mode');
          break;
        case google.maps.MapTypeId.ROADMAP:
          map.setOptions({ styles: [] }); // Clear any custom styles
          map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
          break;
        case google.maps.MapTypeId.HYBRID:
          map.setOptions({ styles: [] }); // Clear any custom styles
          map.setMapTypeId(google.maps.MapTypeId.HYBRID);
          break;
        default:
          console.error('Unknown map type:', mapType);
      }
      console.log('Map type changed successfully'); // Debug log
    } catch (error) {
      console.error('Error changing map type:', error);
    }
    
    setIsOpen(false);
  };

  return (
    <div className="absolute top-4 right-4 z-10" ref={dropdownRef}>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-[#1B1B1B]/95 backdrop-blur-sm rounded-lg border border-stone-800/50 text-stone-400 hover:text-stone-200 transition-colors"
        >
          <Layers className="w-5 h-5" />
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-2 bg-[#1B1B1B]/95 backdrop-blur-sm rounded-lg border border-stone-800/50 overflow-hidden flex flex-col gap-1 p-1">
            <button
              onClick={() => handleMapTypeChange(google.maps.MapTypeId.ROADMAP)}
              className="flex items-center justify-center px-3 py-2 text-sm text-stone-400 hover:bg-stone-800/50 hover:text-stone-200 rounded-md"
            >
              <Sun className="w-4 h-4 text-yellow-400" />
            </button>
            <button
              onClick={() => handleMapTypeChange('dark_mode')}
              className="flex items-center justify-center px-3 py-2 text-sm text-stone-400 hover:bg-stone-800/50 hover:text-stone-200 rounded-md"
            >
              <Moon className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => handleMapTypeChange(google.maps.MapTypeId.HYBRID)}
              className="flex items-center justify-center px-3 py-2 text-sm text-stone-400 hover:bg-stone-800/50 hover:text-stone-200 rounded-md"
            >
              <Satellite className="w-4 h-4 text-emerald-500" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 