import { Cloud, CloudRain, CloudSnow, Sun, Wind, Droplets } from 'lucide-react';

interface WeatherData {
  temperature: number;
  conditions: string;
  windSpeed: number;
  humidity: number;
  precipitation?: number;
  icon: string;
  location?: string;
}

interface WeatherWidgetProps {
  data: WeatherData;
}

export function WeatherWidget({ data }: WeatherWidgetProps) {
  const getWeatherIcon = () => {
    const condition = data.conditions.toLowerCase();
    if (condition.includes('rain')) return <CloudRain className="w-6 h-6 text-blue-400" />;
    if (condition.includes('snow')) return <CloudSnow className="w-6 h-6 text-blue-200" />;
    if (condition.includes('cloud')) return <Cloud className="w-6 h-6 text-stone-300" />;
    return <Sun className="w-6 h-6 text-yellow-400" />;
  };

  // Extract city and state from location if available
  const locationParts = data.location?.split(',').map(part => part.trim()) || [];
  const city = locationParts[1];
  const state = locationParts[2]?.split(' ')[0];
  const locationDisplay = city && state ? `${city}, ${state}` : '';

  // Convert Celsius to Fahrenheit
  const tempF = Math.round((data.temperature * 9/5) + 32);

  return (
    <div className="bg-[#1B1B1B]/95 backdrop-blur-sm rounded-lg border border-stone-800/50 px-4 py-3">
      <div className="flex items-center gap-6">
        {/* Temperature and Location Section */}
        <div className="flex items-center gap-2.5">
          {getWeatherIcon()}
          <div className="flex flex-col">
            <span className="text-xl font-semibold leading-none mb-0.5">{tempF}°F</span>
            {locationDisplay && (
              <span className="text-xs font-medium text-emerald-400/90">
                {locationDisplay}
              </span>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-stone-700/50"></div>

        {/* Weather Details Section */}
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-sm text-stone-200">
            <Wind className="w-4 h-4 text-stone-400" />
            {Math.round(data.windSpeed)} mph
          </span>
          <span className="flex items-center gap-1 text-sm text-stone-200">
            <Droplets className="w-4 h-4 text-blue-400" />
            {data.precipitation ?? Math.round(data.humidity / 10)}%
          </span>
        </div>
      </div>
    </div>
  );
} 