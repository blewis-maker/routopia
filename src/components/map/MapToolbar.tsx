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
    activeColor: 'text-yellow-400 bg-stone-800/50',
    hoverColor: 'hover:text-yellow-400 hover:bg-stone-800/30'
  },
  dark: {
    id: 'mapbox/dark-v11',
    icon: Moon,
    label: 'Dark mode',
    activeColor: 'text-teal-400 bg-stone-800/50',
    hoverColor: 'hover:text-teal-400 hover:bg-stone-800/30'
  },
  satellite: {
    id: 'mapbox/satellite-streets-v12',
    icon: Satellite,
    label: 'Satellite view',
    activeColor: 'text-emerald-500 bg-stone-800/50',
    hoverColor: 'hover:text-emerald-500 hover:bg-stone-800/30'
  }
};

console.log('MAP_STYLES:', MAP_STYLES);

export function MapToolbar({ mapIntegration }: MapToolbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStyle, setCurrentStyle] = useState<keyof typeof MAP_STYLES>('dark');
  const [isChangingStyle, setIsChangingStyle] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(menuRef, () => setIsOpen(false));

  const handleStyleChange = async (style: keyof typeof MAP_STYLES) => {
    if (!mapIntegration) {
      console.error('Map integration not available');
      return;
    }

    if (isChangingStyle) {
      console.log('Style change already in progress');
      return;
    }

    try {
      setIsChangingStyle(true);
      const styleUrl = `mapbox://styles/${MAP_STYLES[style].id}`;
      console.log('Attempting style change to:', styleUrl);

      await mapIntegration.setMapboxStyle(styleUrl);
      setCurrentStyle(style);
      console.log('Style change completed successfully');
    } catch (error) {
      console.error('Error changing map style:', error);
      if (mapIntegration.isReady()) {
        try {
          const prevStyleUrl = `mapbox://styles/${MAP_STYLES[currentStyle].id}`;
          await mapIntegration.setMapboxStyle(prevStyleUrl);
        } catch (revertError) {
          console.error('Failed to revert style:', revertError);
        }
      }
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
            'w-10 flex flex-col gap-1'
          )}>
            {Object.entries(MAP_STYLES).map(([type, { icon: Icon, activeColor, hoverColor, label }]) => (
              <Button
                key={type}
                variant="ghost"
                size="sm"
                onClick={() => handleStyleChange(type as keyof typeof MAP_STYLES)}
                disabled={isChangingStyle}
                className={cn(
                  'flex items-center justify-center w-full p-2 transition-all duration-200',
                  currentStyle === type 
                    ? activeColor 
                    : `text-stone-400 ${hoverColor}`
                )}
                aria-label={label}
              >
                <Icon className={cn(
                  'w-4 h-4',
                  currentStyle === type && 'animate-pulse-subtle'
                )} />
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 