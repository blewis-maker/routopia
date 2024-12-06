import { useState, useEffect } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';

interface WeatherData {
  current: {
    temperature: number;
    condition: string;
    icon: string;
    wind: number;
    precipitation: number;
  };
  forecast: Array<{
    day: string;
    temperature: number;
    condition: string;
    icon: string;
  }>;
}

export function WeatherWidget() {
  const { location, error, loading } = useGeolocation();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  useEffect(() => {
    if (location) {
      const fetchWeather = async () => {
        try {
          const response = await fetch(
            `/api/weather?lat=${location.lat}&lng=${location.lng}`
          );
          const data = await response.json();
          setWeather(data);
        } catch (error) {
          console.error('Failed to fetch weather:', error);
        } finally {
          setWeatherLoading(false);
        }
      };

      fetchWeather();
    }
  }, [location]);

  if (loading || weatherLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-stone-700 rounded w-1/3 mb-4"></div>
        <div className="h-32 bg-stone-700 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-stone-400 text-center py-4">
        Unable to fetch weather information
      </div>
    );
  }

  if (!weather) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white">Weather</h2>
      
      <div className="bg-stone-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-3xl font-medium text-white">
              {weather.current.temperature}°C
            </div>
            <div className="text-stone-400">{weather.current.condition}</div>
          </div>
          <img 
            src={weather.current.icon} 
            alt={weather.current.condition}
            className="w-16 h-16"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-stone-400">Wind</span>
            <div className="text-white">{weather.current.wind} km/h</div>
          </div>
          <div>
            <span className="text-stone-400">Precipitation</span>
            <div className="text-white">{weather.current.precipitation}%</div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-stone-600">
          <div className="flex justify-between">
            {weather.forecast.map((day) => (
              <div key={day.day} className="text-center">
                <div className="text-stone-400 text-sm">{day.day}</div>
                <img 
                  src={day.icon} 
                  alt={day.condition}
                  className="w-8 h-8 mx-auto my-1"
                />
                <div className="text-white">{day.temperature}°C</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 