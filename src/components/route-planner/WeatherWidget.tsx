'use client';

import { Cloud, CloudRain, CloudSnow, Sun, Wind, Droplets } from 'lucide-react';
import { cn } from '@/lib/utils';
import { styleGuide as sg } from '@/styles/theme/styleGuide';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/Tooltip";

interface WeatherWidgetProps {
  data: {
    temperature: number;
    conditions: string;
    windSpeed: number;
    windDirection: number;
    windGust?: number;
    humidity: number;
    icon: string;
    location?: string;
  };
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
    
    // Special case for "Current Location"
    if (location === 'Current Location') return location;
    
    // Split by commas and clean up whitespace
    const parts = location.split(',').map(part => part.trim());
    
    // For addresses like "878 Wagon Bend Rd, Berthoud, CO 80513, USA"
    // or "Berthoud, CO 80513, USA"
    // We want to extract just "Berthoud, CO"
    
    // Find the city and state parts
    let cityIndex = parts.length > 2 ? parts.length - 3 : 0; // City is usually third from last or first
    let stateWithZipIndex = parts.length > 1 ? parts.length - 2 : 1; // State+ZIP is usually second from last
    
    const city = parts[cityIndex];
    // Extract just the state from "CO 80513"
    const state = parts[stateWithZipIndex]?.split(' ')[0];
    
    if (city && state) {
      return `${city}, ${state}`;
    }
    
    // Fallback to just the first part if we can't parse it properly
    return parts[0];
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
      <Tooltip>
        <TooltipTrigger className="flex items-center gap-1.5">
          {getWeatherIcon()}
          <span className={cn(
            sg.typography.base,
            sg.typography.sizes.sm,
            sg.colors.text.primary
          )}>
            {data.temperature > 0 ? `${Math.round(data.temperature)}°F` : '--°F'}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          {data.conditions}
        </TooltipContent>
      </Tooltip>

      <div className="flex items-center gap-1.5">
        <Droplets className={cn(
          "w-4 h-4", 
          data.humidity > 75 
            ? cn("text-blue-400", "animate-weather-blink")
            : data.humidity > 50 
              ? "text-blue-400"
              : "text-blue-300"
        )} />
        <span className={cn(
          sg.typography.base,
          sg.typography.sizes.sm,
          sg.colors.text.primary
        )}>
          {data.humidity || '--'}%
        </span>
      </div>

      <Tooltip>
        <TooltipTrigger className="flex items-center gap-1.5">
          <Wind className={cn(
            "w-4 h-4",
            data.windSpeed > 15
              ? cn("text-stone-100", "animate-weather-blink")
              : data.windSpeed > 8
                ? "text-stone-100"
                : sg.colors.text.secondary
          )} />
          <span className={cn(
            sg.typography.base,
            sg.typography.sizes.sm,
            data.windSpeed > 15 ? "text-stone-100" : sg.colors.text.primary
          )}>
            {data.windSpeed ? `${Math.round(data.windSpeed)} mph` : '--'}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <span>{data.windDirection}° · gusts {Math.round(data.windGust || data.windSpeed)} mph</span>
        </TooltipContent>
      </Tooltip>

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