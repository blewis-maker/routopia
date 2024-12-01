import { useEffect, useState } from 'react';
import { Cloud, Sun, CloudRain } from 'lucide-react';

interface WeatherData {
  type: 'clear' | 'cloudy' | 'rain';
  temperature: number;
}

export function WeatherOverlay({ map }: { map: mapboxgl.Map | null }) {
  const [weather, setWeather] = useState<WeatherData>({
    type: 'clear',
    temperature: 72
  });

  const WeatherIcon = {
    clear: Sun,
    cloudy: Cloud,
    rain: CloudRain
  }[weather.type];

  return (
    <div className="
      absolute top-4 left-4
      px-3 py-2 rounded-lg
      bg-stone-900/80 backdrop-blur-sm
      text-white
      flex items-center space-x-2
      transition-all duration-300
      hover:bg-stone-800
    ">
      <WeatherIcon className="h-4 w-4 text-teal-400" />
      <span className="text-sm font-medium">
        {weather.temperature}°F
      </span>
    </div>
  );
} 