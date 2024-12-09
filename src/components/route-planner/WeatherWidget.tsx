import { Sun, Cloud, CloudRain, CloudSnow, CloudFog, Moon } from 'lucide-react';

interface WeatherData {
  temperature: number;
  conditions: string;
  windSpeed: number;
  humidity: number;
  icon: string;
}

interface WeatherWidgetProps {
  data: WeatherData;
}

export function WeatherWidget({ data }: WeatherWidgetProps) {
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

  // Convert Celsius to Fahrenheit
  const tempF = Math.round((data.temperature * 9/5) + 32);

  return (
    <div className="flex items-center gap-3 px-4 py-2">
      {getWeatherIcon(data.conditions, data.icon)}
      <div className="text-lg font-medium text-white">
        {tempF}°F
      </div>
      <div className="text-stone-300 text-sm border-l border-stone-700 pl-3 flex gap-4">
        <span className="capitalize">{data.conditions}</span>
        <span>Wind: {Math.round(data.windSpeed * 2.237)} mph</span>
        <span>Humidity: {data.humidity}%</span>
      </div>
    </div>
  );
} 