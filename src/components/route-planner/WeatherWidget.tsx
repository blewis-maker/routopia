'use client';

import { Cloud, CloudRain, CloudSnow, Sun, Wind, Droplets } from 'lucide-react';
import { WeatherData } from '@/types/weather';
import { cn } from '@/lib/utils';
import { styleGuide as sg } from '@/styles/theme/styleGuide';

interface WeatherWidgetProps {
  data: WeatherData;
}

export function WeatherWidget({ data }: WeatherWidgetProps) {
  const getWeatherIcon = () => {
    const condition = data.conditions.toLowerCase();
    
    if (condition.includes('rain')) 
      return (
        <CloudRain 
          className={cn(
            "w-[17px] h-[17px]",
            sg.colors.text.accent,
            "animate-weather-blink"
          )} 
        />
      );
      
    if (condition.includes('snow')) 
      return (
        <CloudSnow 
          className={cn(
            "w-[17px] h-[17px]",
            sg.colors.text.accent,
            "animate-weather-blink"
          )} 
        />
      );
      
    if (condition.includes('cloud')) 
      return (
        <Cloud 
          className={cn(
            "w-[17px] h-[17px]",
            "text-stone-100" // White for clouds
          )} 
        />
      );
      
    if (condition.includes('unavailable')) 
      return (
        <Cloud 
          className={cn(
            "w-[17px] h-[17px]",
            "text-stone-500"
          )} 
        />
      );
      
    return (
      <Sun 
        className={cn(
          "w-[17px] h-[17px]",
          "text-yellow-400" // Yellow for sun
        )} 
      />
    );
  };

  const formatLocation = (location?: string) => {
    if (!location) return '';
    const parts = location.split(',').map(part => part.trim());
    const city = parts[1];
    const state = parts[2]?.split(' ')[0];
    return state ? `${city}, ${state}` : city;
  };

  return (
    <div className={cn(
      "flex items-center gap-2",
      "px-3 py-2 rounded-md",
      sg.colors.background.primary,
      sg.colors.border.primary,
      "border",
      sg.effects.glass,
      sg.effects.shadow
    )}>
      <div className="flex items-center gap-1.5">
        {getWeatherIcon()}
        <span className={cn(
          sg.typography.base,
          sg.typography.sizes.sm,
          sg.colors.text.primary
        )}>
          {data.temperature > 0 ? `${Math.round(data.temperature)}°F` : '--°F'}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <Droplets className={cn("w-4 h-4", "text-blue-400")} />
        <span className={cn(
          sg.typography.base,
          sg.typography.sizes.sm,
          sg.colors.text.primary
        )}>
          {data.humidity || '--'}%
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <Wind className={cn("w-4 h-4", sg.colors.text.secondary)} />
        <span className={cn(
          sg.typography.base,
          sg.typography.sizes.sm,
          sg.colors.text.primary
        )}>
          {data.windSpeed ? `${Math.round(data.windSpeed)} mph` : '--'}
        </span>
      </div>

      <span className={cn(
        "ml-2 px-2 py-0.5 rounded",
        sg.colors.background.secondary,
        sg.typography.sizes.sm,
        sg.colors.text.secondary
      )}>
        {formatLocation(data.location)}
      </span>
    </div>
  );
} 