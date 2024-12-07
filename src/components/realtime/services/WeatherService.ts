export class WeatherService {
  static async getCurrentWeather() {
    return {
      temperature: 20,
      conditions: 'Clear',
      location: 'New York, NY'
    };
  }

  static async getForecast() {
    return [
      { day: 'Mon', temp: 22, conditions: 'Sunny' },
      { day: 'Tue', temp: 19, conditions: 'Cloudy' },
      { day: 'Wed', temp: 18, conditions: 'Rain' },
      { day: 'Thu', temp: 21, conditions: 'Clear' },
      { day: 'Fri', temp: 23, conditions: 'Sunny' },
    ];
  }
} 