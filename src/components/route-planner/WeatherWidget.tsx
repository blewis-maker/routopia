import { Cloud, CloudRain, CloudSnow, Sun, Wind, Droplets } from 'lucide-react';
import { WeatherData } from '@/types/weather';

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
    <div className="bg-[#1B1B1B]/95 backdrop-blur-sm rounded-lg border border-stone-800/50">
      <div className="flex flex-col px-4 py-2">
        {/* Weather info */}
        <div className="flex items-center gap-4">
          {/* Weather Icon */}
          <div className="flex items-center">
            {getWeatherIcon()}
          </div>

          {/* Temperature */}
          <div className="flex items-center text-stone-200">
            <span className="text-[19px] font-medium">
              {data.temperature > 0 ? `${Math.round(data.temperature)}°F` : '--°F'}
            </span>
          </div>

          {/* Humidity */}
          <div className="flex items-center gap-1.5">
            <Droplets className="w-[17px] h-[17px] text-blue-400" />
            <span className="text-[14px] text-stone-200">
              {data.humidity || '--'}%
            </span>
          </div>

          {/* Wind Speed */}
          <div className="flex items-center gap-1.5">
            <Wind className="w-[17px] h-[17px] text-stone-400" />
            <span className="text-[14px] text-stone-200">
              {data.windSpeed ? `${Math.round(data.windSpeed)} mph` : '--'}
            </span>
          </div>
        </div>

        {/* Location text below - centered */}
        {data.location && (
          <div className="mt-1 text-center">
            <span className="text-[11px] text-stone-400 font-medium tracking-wide">
              {formatLocation(data.location)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
} 