'use client';

import { useState, useRef, useMemo } from 'react';
import { Sun, Moon, Satellite, Layers } from 'lucide-react';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import { HybridMapService } from '@/services/maps/HybridMapService';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { baseStyles, roundedStyles, glassStyles } from '@/styles/components';

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
        <Button
          variant="glass"
          size="md"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isChangingStyle}
          aria-label="Map Style Options"
        >
          <Layers className="w-5 h-5" />
        </Button>

        {isOpen && (
          <div className={cn(
            baseStyles.card,
            roundedStyles.lg,
            glassStyles.dark,
            'absolute top-full right-0 mt-2 p-1 flex flex-col gap-1 w-10'
          )}>
            {styleButtons.map(({ type, icon: Icon, activeColor, hoverColor, label }) => (
              <Button
                key={type}
                variant="ghost"
                size="sm"
                onClick={() => handleMapTypeChange(type)}
                disabled={isChangingStyle}
                className={cn(
                  'flex items-center justify-center w-full',
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