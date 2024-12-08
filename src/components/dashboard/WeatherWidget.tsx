import { useEffect, useState } from 'react';
import { WeatherData } from '@/services/maps/WeatherLayer';
import { Coordinates } from '@/services/maps/MapServiceInterface';

interface WeatherWidgetProps {
  coordinates: Coordinates;
}

export function WeatherWidget({ coordinates }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/weather?lat=${coordinates.lat}&lng=${coordinates.lng}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }
        const data = await response.json();
        setWeather(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load weather');
        console.error('Weather fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (coordinates) {
      fetchWeather();
    }
  }, [coordinates]);

  if (isLoading) {
    return (
      <div className="animate-pulse bg-stone-800 rounded-lg p-4">
        <div className="h-6 w-24 bg-stone-700 rounded mb-2"></div>
        <div className="h-4 w-16 bg-stone-700 rounded"></div>
      </div>
    );
  }

  if (error) {
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