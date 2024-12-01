import React, { useEffect, useState } from 'react';
import { WeatherData } from '@/types/weather';

interface Props {
  coordinates: [number, number];
  onWeatherUpdate: (weather: WeatherData) => void;
}

export const WeatherOverlay: React.FC<Props> = ({ coordinates, onWeatherUpdate }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(`/api/weather?lat=${coordinates[0]}&lon=${coordinates[1]}`);
        const data = await response.json();
        setWeather(data);
        onWeatherUpdate(data);
      } catch (error) {
        console.error('Failed to fetch weather:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [coordinates, onWeatherUpdate]);

  if (loading) return null;

  return (
    <div className="weather-overlay absolute top-4 right-4 bg-black/50 backdrop-blur-sm p-4 rounded-lg text-white">
      {weather && (
        <>
          <div className="flex items-center gap-2">
            <img 
              src={`/weather-icons/${weather.icon}.svg`} 
              alt={weather.description}
              className="w-8 h-8"
            />
            <div className="text-lg font-semibold">{weather.temperature}°C</div>
          </div>
          <div className="text-sm mt-1">{weather.description}</div>
          <div className="text-xs mt-2">
            <div>Humidity: {weather.humidity}%</div>
            <div>Wind: {weather.windSpeed} km/h</div>
          </div>
        </>
      )}
    </div>
  );
}; 