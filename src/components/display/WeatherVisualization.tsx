import React, { useCallback } from 'react';
import type { WeatherData } from '@/types/routes';

interface Props {
  weather: WeatherData;
  onAlertClick?: (alert: WeatherData['alerts'][0]) => void;
  id?: string;
}

export const WeatherVisualization: React.FC<Props> = ({ 
  weather, 
  onAlertClick,
  id = 'weather-visualization'
}) => {
  const getWeatherIcon = useCallback((condition: WeatherData['condition']) => {
    switch (condition) {
      case 'clear': return { icon: '☀️', label: 'Clear weather' };
      case 'rain': return { icon: '🌧️', label: 'Rainy weather' };
      case 'snow': return { icon: '🌨️', label: 'Snowy weather' };
      case 'cloudy': return { icon: '☁️', label: 'Cloudy weather' };
      default: return { icon: '🌤️', label: 'Partly cloudy' };
    }
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, alert: WeatherData['alerts'][0]) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onAlertClick?.(alert);
    }
  }, [onAlertClick]);

  const weatherInfo = getWeatherIcon(weather.condition);

  return (
    <div 
      className="weather-visualization p-4 bg-stone-800/90 backdrop-blur-sm rounded-lg"
      role="region"
      aria-label="Weather information"
      id={id}
    >
      <div className="flex items-center space-x-4">
        <span 
          className="text-4xl" 
          role="img" 
          aria-label={weatherInfo.label}
        >
          {weatherInfo.icon}
        </span>
        <div>
          <div 
            className="text-2xl font-semibold text-white"
            aria-label={`Temperature: ${weather.temperature} degrees`}
          >
            {weather.temperature}°
          </div>
          <div 
            className="text-sm text-stone-400"
            aria-label={`Wind speed: ${weather.windSpeed} kilometers per hour`}
          >
            Wind: {weather.windSpeed} km/h
          </div>
        </div>
      </div>

      {weather.alerts && weather.alerts.length > 0 && (
        <div 
          className="mt-4 space-y-2"
          role="list"
          aria-label="Weather alerts"
        >
          {weather.alerts.map((alert, index) => (
            <button
              key={index}
              onClick={() => onAlertClick?.(alert)}
              onKeyDown={(e) => handleKeyDown(e, alert)}
              className={`w-full p-2 rounded text-left text-sm text-white focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                alert.severity === 'warning' ? 'bg-red-500' :
                alert.severity === 'watch' ? 'bg-amber-500' :
                alert.severity === 'advisory' ? 'bg-blue-500' :
                'bg-stone-500'
              }`}
              role="listitem"
              aria-label={`${alert.severity} alert: ${alert.type}`}
            >
              <div className="font-medium">{alert.type}</div>
              <div className="text-xs opacity-90">{alert.message}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}; 