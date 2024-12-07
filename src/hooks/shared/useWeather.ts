import { useState, useEffect } from 'react';
import { weatherService, WeatherData } from '@/services/weather/client';

interface UseWeatherOptions {
  lat: number;
  lon: number;
  refreshInterval?: number;
}

export function useWeather({ lat, lon, refreshInterval = 300000 }: UseWeatherOptions) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    let intervalId: NodeJS.Timeout;

    const fetchWeather = async () => {
      try {
        setLoading(true);
        const data = await weatherService.getCurrentWeather(lat, lon);
        if (mounted) {
          setWeather(data);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch weather'));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchWeather();

    if (refreshInterval > 0) {
      intervalId = setInterval(fetchWeather, refreshInterval);
    }

    return () => {
      mounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [lat, lon, refreshInterval]);

  return { weather, loading, error };
} 