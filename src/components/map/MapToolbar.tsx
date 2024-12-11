'use client';

import { useState, useRef } from 'react';
import { Sun, Moon, Satellite, Layers } from 'lucide-react';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import { HybridMapService } from '@/services/maps/HybridMapService';
import { cn } from '@/lib/utils';
import { styleGuide as sg } from '@/styles/theme/styleGuide';

interface MapToolbarProps {
  mapIntegration: HybridMapService | null;
}

const MAP_STYLES = {
  light: {
    icon: Sun,
    label: 'Light mode',
    styleId: 'light',
    activeColor: `${sg.colors.text.accent} ${sg.colors.background.secondary}`,
    hoverColor: sg.colors.hover.text,
  },
  dark: {
    icon: Moon,
    label: 'Dark mode',
    styleId: 'dark',
    activeColor: `${sg.colors.text.accent} ${sg.colors.background.secondary}`,
    hoverColor: sg.colors.hover.text,
  },
  satellite: {
    icon: Satellite,
    label: 'Satellite view',
    styleId: 'satellite',
    activeColor: `${sg.colors.text.accent} ${sg.colors.background.secondary}`,
    hoverColor: sg.colors.hover.text,
  },
};

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
    <div className="absolute bottom-6 left-6 z-10" ref={menuRef}>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "p-2 rounded-md",
            sg.colors.background.primary,
            sg.colors.border.primary,
            "border",
            sg.effects.shadow,
            "transition-all duration-200",
            isOpen && sg.colors.border.accent
          )}
          disabled={isChangingStyle}
        >
          <Layers className={cn(
            "w-5 h-5",
            sg.colors.text.secondary,
            !isChangingStyle && sg.colors.hover.text
          )} />
        </button>

        {isOpen && (
          <div className={cn(
            "absolute bottom-full mb-2 left-0",
            "rounded-md overflow-hidden",
            sg.colors.background.primary,
            sg.colors.border.primary,
            "border",
            sg.effects.shadow
          )}>
            {Object.entries(MAP_STYLES).map(([type, { icon: Icon, label, activeColor, hoverColor }]) => (
              <button
                key={type}
                onClick={() => handleStyleChange(type as keyof typeof MAP_STYLES)}
                disabled={isChangingStyle}
                className={cn(
                  "flex items-center justify-center w-full p-2",
                  sg.effects.transition,
                  currentStyle === type 
                    ? activeColor 
                    : `${sg.colors.text.secondary} ${hoverColor}`
                )}
                aria-label={label}
              >
                <Icon className={cn(
                  "w-4 h-4",
                  currentStyle === type && "animate-pulse-subtle"
                )} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 