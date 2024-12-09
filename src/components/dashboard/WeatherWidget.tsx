import { useEffect, useState, useCallback, useRef } from 'react';
import { WeatherData } from '@/services/maps/WeatherLayer';
import { Coordinates } from '@/services/maps/MapServiceInterface';
import { Sun, Cloud, CloudRain, CloudSnow, CloudFog, Moon } from 'lucide-react';

interface WeatherWidgetProps {
  coordinates: Coordinates;
}

export function WeatherWidget({ coordinates }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastCoordinatesRef = useRef<string>('');

  const fetchWeather = useCallback(async () => {
    // Check if coordinates are valid
    if (!coordinates || !coordinates.lat || !coordinates.lng) {
      return;
    }

    // Check if coordinates have changed
    const coordString = `${coordinates.lat},${coordinates.lng}`;
    if (coordString === lastCoordinatesRef.current) {
      return;
    }
    lastCoordinatesRef.current = coordString;

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/weather?lat=${coordinates.lat}&lng=${coordinates.lng}`,
        {
          signal: abortControllerRef.current.signal,
          headers: {
            'Cache-Control': 'no-cache'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch weather data');
      }

      const data = await response.json();
      
      if (!data || typeof data.temperature !== 'number') {
        throw new Error('Invalid weather data received');
      }

      setWeather(data);
      setError(null);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      console.error('Weather fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load weather');
      setWeather(null);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [coordinates]);

  useEffect(() => {
    fetchWeather();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchWeather]);

  const getWeatherIcon = (condition: string, icon: string) => {
    // Check if it's night (icon codes ending with 'n')
    const isNight = icon.endsWith('n');
    const conditionLower = condition.toLowerCase();

    if (isNight && conditionLower.includes('clear')) {
      return <Moon className="w-8 h-8 text-stone-300" />;
    }
    
    if (conditionLower.includes('clear') || conditionLower.includes('sun')) {
      return <Sun className="w-8 h-8 text-yellow-400" />;
    }
    if (conditionLower.includes('rain')) {
      return <CloudRain className="w-8 h-8 text-blue-400" />;
    }
    if (conditionLower.includes('snow')) {
      return <CloudSnow className="w-8 h-8 text-blue-200" />;
    }
    if (conditionLower.includes('fog') || conditionLower.includes('mist')) {
      return <CloudFog className="w-8 h-8 text-stone-400" />;
    }
    if (conditionLower.includes('cloud')) {
      return <Cloud className="w-8 h-8 text-stone-300" />;
    }
    
    return <Sun className="w-8 h-8 text-yellow-400" />;
  };

  if (isLoading && !weather) {
    return (
      <div className="flex items-center gap-3 px-4 py-2">
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-8 h-8 bg-stone-700 rounded-full"></div>
          <div className="h-6 w-16 bg-stone-700 rounded"></div>
          <div className="h-4 w-20 bg-stone-700 rounded"></div>
          <div className="h-4 w-48 bg-stone-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error && !weather) {
    return (
      <div className="px-4 py-2">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (!weather) {
    return null;
  }

  // Convert Celsius to Fahrenheit
  const tempF = Math.round((weather.temperature * 9/5) + 32);

  return (
    <div className="flex items-center gap-3 px-4 py-2">
      {getWeatherIcon(weather.conditions, weather.icon)}
      <div className="text-lg font-medium text-white">
        {tempF}°F
      </div>
      <div className="text-stone-300 text-sm border-l border-stone-700 pl-3 flex gap-4">
        <span className="capitalize">{weather.conditions}</span>
        <span>Wind: {Math.round(weather.windSpeed * 2.237)} mph</span>
        <span>Humidity: {weather.humidity}%</span>
      </div>
    </div>
  );
} 