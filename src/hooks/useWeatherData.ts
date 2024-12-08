import { useState, useEffect } from 'react';
import { WeatherLayer } from '@/services/maps/WeatherLayer';

const weatherLayer = new WeatherLayer();

export interface WeatherWidgetData {
  temperature: number;
  condition: string;
  icon: string;
  precipitation: number;
  windSpeed: number;
  humidity: number;
}

export function useWeatherData(coordinates: { lat: number; lng: number } | null) {
  const [data, setData] = useState<WeatherWidgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!coordinates) return;

    let mounted = true;
    setLoading(true);

    const fetchWeather = async () => {
      try {
        const weatherData = await weatherLayer.getWeatherData(coordinates);
        
        if (!mounted) return;

        setData({
          temperature: Math.round((weatherData.temperature * 9/5) + 32), // Convert to Fahrenheit
          condition: weatherData.conditions,
          icon: weatherData.icon,
          precipitation: weatherData.precipitation,
          windSpeed: Math.round(weatherData.windSpeed * 2.237), // Convert to mph
          humidity: weatherData.humidity
        });
        setError(null);
      } catch (err) {
        if (!mounted) return;
        console.error('Weather fetch error:', err);
        setError('Failed to load weather data');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchWeather();

    // Refresh every 5 minutes
    const interval = setInterval(fetchWeather, 5 * 60 * 1000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [coordinates]);

  return { data, loading, error };
} 