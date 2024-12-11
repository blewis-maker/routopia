'use client';

import { useState, useRef } from 'react';
import { Sun, Moon, Satellite, Layers } from 'lucide-react';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import { HybridMapService } from '@/services/maps/HybridMapService';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { baseStyles, roundedStyles, glassStyles } from '@/styles/components';

interface MapToolbarProps {
  mapIntegration: HybridMapService | null;
}

const MAP_STYLES = {
  light: {
    id: 'mapbox/light-v11',
    icon: Sun,
    label: 'Light mode',
    activeColor: 'text-yellow-400',
    hoverColor: 'hover:text-yellow-400'
  },
  dark: {
    id: 'mapbox/dark-v11',
    icon: Moon,
    label: 'Dark mode',
    activeColor: 'text-white',
    hoverColor: 'hover:text-white'
  },
  satellite: {
    id: 'mapbox/satellite-streets-v12',
    icon: Satellite,
    label: 'Satellite view',
    activeColor: 'text-emerald-500',
    hoverColor: 'hover:text-emerald-500'
  }
};

export function MapToolbar({ mapIntegration }: MapToolbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStyle, setCurrentStyle] = useState<keyof typeof MAP_STYLES>('dark');
  const [isChangingStyle, setIsChangingStyle] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(menuRef, () => setIsOpen(false));

  const handleStyleChange = async (style: keyof typeof MAP_STYLES) => {
    if (!mapIntegration || isChangingStyle) return;

    try {
      setIsChangingStyle(true);
      await mapIntegration.setMapboxStyle(`mapbox://styles/${MAP_STYLES[style].id}`);
      setCurrentStyle(style);
    } catch (error) {
      console.error('Error changing map style:', error);
    } finally {
      setIsChangingStyle(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="absolute top-4 right-4 z-10" ref={menuRef}>
      <div className="relative">
        <Button
          variant="glass"
          size="md"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isChangingStyle}
          aria-label="Map Style Options"
          className="w-10 h-10 p-2"
        >
          <Layers className="w-5 h-5" />
        </Button>

        {isOpen && (
          <div className={cn(
            baseStyles.card,
            roundedStyles.lg,
            glassStyles.dark,
            'absolute top-full right-0 mt-2 p-1',
            'w-10 flex flex-col gap-1'  // Match button width
          )}>
            {Object.entries(MAP_STYLES).map(([type, { icon: Icon, activeColor, hoverColor, label }]) => (
              <Button
                key={type}
                variant="ghost"
                size="sm"
                onClick={() => handleStyleChange(type as keyof typeof MAP_STYLES)}
                disabled={isChangingStyle}
                className={cn(
                  'flex items-center justify-center w-full p-2',
                  currentStyle === type 
                    ? `${activeColor} bg-stone-800` 
                    : `text-stone-400 ${hoverColor}`
                )}
                aria-label={label}
              >
                <Icon className="w-4 h-4" />
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 