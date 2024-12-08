import { useEffect, useState, useCallback, useRef } from 'react';
import { WeatherData } from '@/services/maps/WeatherLayer';
import { Coordinates } from '@/services/maps/MapServiceInterface';

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

  if (isLoading && !weather) {
    return (
      <div className="animate-pulse bg-stone-800 rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-stone-700 rounded-full"></div>
          <div className="space-y-2">
            <div className="h-6 w-24 bg-stone-700 rounded"></div>
            <div className="h-4 w-16 bg-stone-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !weather) {
    return (
      <div className="bg-red-900/50 text-red-200 rounded-lg p-4">
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!weather) {
    return null;
  }

  return (
    <div className="bg-stone-800/90 rounded-lg p-4 backdrop-blur">
      <div className="flex items-center space-x-4">
        <img
          src={`https://openweathermap.org/img/w/${weather.icon}.png`}
          alt={weather.conditions}
          className="w-12 h-12"
          loading="lazy"
        />
        <div>
          <div className="text-2xl font-bold text-white">
            {Math.round(weather.temperature)}°C
          </div>
          <div className="text-stone-400 text-sm capitalize">
            {weather.conditions}
          </div>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-stone-400">
        <div>
          <span className="font-medium">Wind:</span>{' '}
          {Math.round(weather.windSpeed)} m/s
        </div>
        <div>
          <span className="font-medium">Humidity:</span> {weather.humidity}%
        </div>
      </div>
    </div>
  );
} 