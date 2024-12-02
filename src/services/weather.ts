import type { WeatherCondition } from '../types/activities-enhanced';

interface WeatherData {
  temperature: number;
  windSpeed: number;
  condition: WeatherCondition;
  humidity: number;
  visibility: number;
}

const API_KEY = process.env.WEATHER_API_KEY;
const API_BASE_URL = 'https://api.weatherservice.com/v1';

export async function getCurrentWeather(): Promise<WeatherData> {
  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });

    const response = await fetch(
      `${API_BASE_URL}/current?lat=${position.coords.latitude}&lon=${position.coords.longitude}&appid=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Weather service request failed');
    }

    const data = await response.json();
    
    return {
      temperature: data.main.temp,
      windSpeed: data.wind.speed,
      condition: mapCondition(data.weather[0].main),
      humidity: data.main.humidity,
      visibility: data.visibility
    };
  } catch (error) {
    console.error('Failed to fetch weather data:', error);
    // Return fallback data
    return {
      temperature: 20,
      windSpeed: 5,
      condition: 'clear',
      humidity: 50,
      visibility: 10000
    };
  }
}

function mapCondition(apiCondition: string): WeatherCondition {
  const conditionMap: Record<string, WeatherCondition> = {
    'Clear': 'clear',
    'Clouds': 'cloudy',
    'Rain': 'rain',
    'Snow': 'snow',
    'Thunderstorm': 'storm',
    'Drizzle': 'rain',
    'Mist': 'fog',
    'Fog': 'fog'
  };

  return conditionMap[apiCondition] || 'unknown';
} 