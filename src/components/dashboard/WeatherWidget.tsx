import { Cloud, Sun, Wind, Droplets, CloudRain } from 'lucide-react';

interface WeatherData {
  current: {
    temp: number;
    condition: string;
    icon: React.ElementType;
    wind: string;
    humidity: string;
  };
  forecast: {
    day: string;
    temp: number;
    condition: string;
    icon: React.ElementType;
  }[];
}

// Mock weather data - replace with actual API call
const weatherData: WeatherData = {
  current: {
    temp: 22,
    condition: 'Partly Cloudy',
    icon: Cloud,
    wind: '12 km/h',
    humidity: '65%',
  },
  forecast: [
    {
      day: 'Tomorrow',
      temp: 24,
      condition: 'Sunny',
      icon: Sun,
    },
    {
      day: 'Wed',
      temp: 20,
      condition: 'Rainy',
      icon: CloudRain,
    },
    {
      day: 'Thu',
      temp: 21,
      condition: 'Cloudy',
      icon: Cloud,
    },
  ],
};

export function WeatherWidget() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Weather</h2>
      
      {/* Current Weather */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <weatherData.current.icon className="h-12 w-12 text-gray-600" />
          <div className="ml-4">
            <div className="text-3xl font-bold text-gray-900">
              {weatherData.current.temp}°C
            </div>
            <div className="text-gray-500">{weatherData.current.condition}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center text-gray-500 mb-1">
            <Wind className="h-4 w-4 mr-1" />
            {weatherData.current.wind}
          </div>
          <div className="flex items-center text-gray-500">
            <Droplets className="h-4 w-4 mr-1" />
            {weatherData.current.humidity}
          </div>
        </div>
      </div>

      {/* Forecast */}
      <div className="border-t pt-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">3-Day Forecast</h3>
        <div className="grid grid-cols-3 gap-4">
          {weatherData.forecast.map((day) => (
            <div
              key={day.day}
              className="text-center p-2 bg-gray-50 rounded-lg"
            >
              <div className="text-sm font-medium text-gray-900 mb-1">
                {day.day}
              </div>
              <day.icon className="h-6 w-6 mx-auto text-gray-600 mb-1" />
              <div className="text-sm font-medium text-gray-900">
                {day.temp}°C
              </div>
              <div className="text-xs text-gray-500">{day.condition}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 