import { Cloud, CloudRain, CloudSnow, Sun, Wind, Droplets } from 'lucide-react';
import { WeatherData } from '@/types/weather';
import { cn } from '@/lib/utils';
import { baseStyles, roundedStyles, glassStyles } from '@/styles/components';

interface WeatherWidgetProps {
  data: WeatherData;
}

export function WeatherWidget({ data }: WeatherWidgetProps) {
  const getWeatherIcon = () => {
    const condition = data.conditions.toLowerCase();
    if (condition.includes('rain')) return <CloudRain className="w-[17px] h-[17px] text-blue-400" />;
    if (condition.includes('snow')) return <CloudSnow className="w-[17px] h-[17px] text-blue-200" />;
    if (condition.includes('cloud')) return <Cloud className="w-[17px] h-[17px] text-stone-300" />;
    if (condition.includes('unavailable')) return <Cloud className="w-[17px] h-[17px] text-stone-500" />;
    return <Sun className="w-[17px] h-[17px] text-yellow-400" />;
  };

  const formatLocation = (location?: string) => {
    if (!location) return '';
    const parts = location.split(',').map(part => part.trim());
    const city = parts[1];
    const state = parts[2]?.split(' ')[0]; // Get state abbreviation
    return state ? `${city}, ${state}` : city;
  };

  return (
    <div className={cn(
      baseStyles.card,
      roundedStyles.lg,
      glassStyles.dark,
      'px-3 py-1.5 flex items-center gap-2'
    )}>
      <div className="flex items-center gap-1.5">
        {getWeatherIcon()}
        <span className="text-sm text-stone-200">
          {data.temperature > 0 ? `${Math.round(data.temperature)}°F` : '--°F'}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <Droplets className="w-4 h-4 text-blue-400" />
        <span className="text-sm text-stone-200">
          {data.humidity || '--'}%
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <Wind className="w-4 h-4 text-stone-400" />
        <span className="text-sm text-stone-200">
          {data.windSpeed ? `${Math.round(data.windSpeed)} mph` : '--'}
        </span>
      </div>

      <div className="text-xs text-stone-400">
        {formatLocation(data.location)}
      </div>
    </div>
  );
} 