'use client';

import { useState, useRef, useMemo } from 'react';
import { Sun, Moon, Satellite, Layers } from 'lucide-react';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import { HybridMapService } from '@/services/maps/HybridMapService';

interface MapToolbarProps {
  mapIntegration: HybridMapService | null;
  onToolSelect: (tool: 'ROUTE' | 'SEARCH' | 'TRAFFIC') => void;
  onPreferencesToggle: () => void;
  showPreferences: boolean;
}

export function MapToolbar({ mapIntegration }: MapToolbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStyle, setCurrentStyle] = useState<'light' | 'dark' | 'satellite'>('light');
  const [isChangingStyle, setIsChangingStyle] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(menuRef, () => setIsOpen(false));

  // Check if map is ready
  const isMapReady = useMemo(() => {
    return mapIntegration?.isReady() ?? false;
  }, [mapIntegration]);

  const handleMapTypeChange = async (mapType: 'light' | 'dark' | 'satellite') => {
    if (!mapIntegration || !isMapReady || isChangingStyle) return;

    try {
      setIsChangingStyle(true);
      await mapIntegration.setTheme(mapType);
      setCurrentStyle(mapType);
    } catch (error) {
      console.error('Error changing map type:', error);
    } finally {
      setIsChangingStyle(false);
    }
  };

  const styleButtons = [
    {
      type: 'light' as const,
      icon: Sun,
      activeColor: 'text-yellow-400',
      hoverColor: 'hover:text-yellow-400',
      label: 'Light mode'
    },
    {
      type: 'dark' as const,
      icon: Moon,
      activeColor: 'text-white',
      hoverColor: 'hover:text-white',
      label: 'Dark mode'
    },
    {
      type: 'satellite' as const,
      icon: Satellite,
      activeColor: 'text-emerald-500',
      hoverColor: 'hover:text-emerald-500',
      label: 'Satellite view'
    }
  ];

  return (
    <div className="absolute top-4 right-4 z-10" ref={menuRef}>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-2 bg-[#1B1B1B]/95 backdrop-blur-sm rounded-lg border border-stone-800/50 
            text-stone-400 hover:text-stone-200 transition-all duration-200 hover:scale-105
            ${isChangingStyle ? 'opacity-50' : ''}`}
          aria-label="Map Style Options"
        >
          <Layers className="w-5 h-5" />
        </button>

        {isOpen && (
          <div 
            className="absolute top-full right-0 mt-2 bg-[#1B1B1B]/95 backdrop-blur-sm rounded-lg 
              border border-stone-800/50 overflow-hidden flex flex-col gap-1 p-1"
            role="menu"
          >
            {styleButtons.map(({ type, icon: Icon, activeColor, hoverColor, label }) => (
              <button
                key={type}
                onClick={() => handleMapTypeChange(type)}
                className={`flex items-center justify-center px-3 py-2 text-sm transition-all 
                  duration-200 hover:scale-105 rounded-md 
                  ${isChangingStyle ? 'opacity-50 cursor-wait' : ''} 
                  ${currentStyle === type 
                    ? `${activeColor} bg-stone-800/50` 
                    : `text-stone-400 ${hoverColor}`
                  }`}
                aria-label={label}
                role="menuitem"
                aria-disabled={isChangingStyle}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 