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
    icon: Sun,
    label: 'Light mode',
    styleId: 'light',
    activeColor: 'text-yellow-400 bg-stone-800/50',
    hoverColor: 'hover:text-yellow-400 hover:bg-stone-800/30'
  },
  dark: {
    icon: Moon,
    label: 'Dark mode',
    styleId: 'dark',
    activeColor: 'text-teal-400 bg-stone-800/50',
    hoverColor: 'hover:text-teal-400 hover:bg-stone-800/30'
  },
  satellite: {
    icon: Satellite,
    label: 'Satellite view',
    styleId: 'satellite',
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
    console.log('Style change requested:', style);
    console.log('Map integration available:', !!mapIntegration);
    
    if (!mapIntegration) {
      console.error('Map integration not available');
      return;
    }

    // Wait for map to be ready
    let attempts = 0;
    const maxAttempts = 20; // Increase max attempts
    
    while (attempts < maxAttempts) {
      if (mapIntegration.isReady()) {
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 250));
      attempts++;
    }

    if (!mapIntegration.isReady()) {
      console.error('Map integration failed to become ready');
      return;
    }

    if (isChangingStyle) {
      console.log('Style change already in progress');
      return;
    }

    try {
      setIsChangingStyle(true);
      const styleId = MAP_STYLES[style].styleId;
      console.log('Style configuration:', {
        requestedStyle: style,
        styleId: styleId
      });
      
      await mapIntegration.setMapStyle(styleId);
      setCurrentStyle(style);
      console.log('Style change completed successfully');
    } catch (error) {
      console.error('Error changing map style:', error instanceof Error ? error.message : 'Unknown error');
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