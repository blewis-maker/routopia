import { ApiCache, CacheDuration } from '@/lib/cache/ApiCache';
import { RequestOptimizer } from '@/lib/api/RequestOptimizer';
import { Coordinates } from './MapServiceInterface';

export interface WeatherData {
  current: {
    temp: number;
    conditions: string;
    windSpeed: number;
    precipitation: number;
    icon: string;
  };
  forecast: Array<{
    timestamp: Date;
    temp: number;
    conditions: string;
    icon: string;
  }>;
}

export class WeatherLayer {
  private apiKey: string;
  private cache: ApiCache;
  private optimizer: RequestOptimizer;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_KEY || '';
    this.cache = ApiCache.getInstance();
    this.optimizer = RequestOptimizer.getInstance();
  }

  async getWeatherData(location: Coordinates): Promise<WeatherData> {
    const cacheKey = `weather:${location.lat.toFixed(4)},${location.lng.toFixed(4)}`;
    const cached = this.cache.get<WeatherData>(cacheKey);
    if (cached) return cached;

    return this.optimizer.optimizedRequest(
      cacheKey,
      async () => {
        const data = await this._fetchWeatherData(location);
        this.cache.set(cacheKey, data, CacheDuration.MINUTES_15);
        return data;
      },
      {
        maxRetries: 2,
        failoverStrategy: 'cache',
        debounceTime: 500
      }
    );
  }

  private async _fetchWeatherData(location: Coordinates): Promise<WeatherData> {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/onecall?` +
        `lat=${location.lat}&lon=${location.lng}&` +
        `appid=${this.apiKey}&units=metric`
      );

      const data = await response.json();
      return this.formatWeatherData(data);
    } catch (error) {
      console.error('Weather data fetch error:', error);
      throw error;
    }
  }

  private formatWeatherData(data: any): WeatherData {
    return {
      current: {
        temp: data.current.temp,
        conditions: data.current.weather[0].description,
        windSpeed: data.current.wind_speed,
        precipitation: data.current.rain?.['1h'] || 0,
        icon: `https://openweathermap.org/img/wn/${data.current.weather[0].icon}@2x.png`
      },
      forecast: data.daily.slice(0, 5).map((day: any) => ({
        timestamp: new Date(day.dt * 1000),
        temp: day.temp.day,
        conditions: day.weather[0].description,
        icon: `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`
      }))
    };
  }

  async showWeatherOverlay(map: mapboxgl.Map | google.maps.Map, location: Coordinates): Promise<void> {
    const weatherData = await this.getWeatherData(location);
    if (map instanceof mapboxgl.Map) {
      await this.showMapboxWeatherOverlay(map, location, weatherData);
    } else {
      await this.showGoogleWeatherOverlay(map, location, weatherData);
    }
  }

  private async showMapboxWeatherOverlay(map: mapboxgl.Map, location: Coordinates, weather: WeatherData): Promise<void> {
    const el = document.createElement('div');
    el.className = 'weather-overlay';
    el.innerHTML = this.createWeatherHTML(weather);

    // Add weather overlay as a marker
    new mapboxgl.Marker(el)
      .setLngLat([location.lng, location.lat])
      .addTo(map);
  }

  private async showGoogleWeatherOverlay(map: google.maps.Map, location: Coordinates, weather: WeatherData): Promise<void> {
    const overlay = new google.maps.OverlayView();
    
    overlay.onAdd = function() {
      const el = document.createElement('div');
      el.className = 'weather-overlay';
      el.innerHTML = this.createWeatherHTML(weather);
      overlay.getPanes().overlayLayer.appendChild(el);
    };

    overlay.draw = function() {
      const projection = overlay.getProjection();
      const point = projection.fromLatLngToDivPixel(
        new google.maps.LatLng(location.lat, location.lng)
      );

      const el = overlay.getPanes().overlayLayer.lastChild as HTMLElement;
      if (el && point) {
        el.style.left = point.x + 'px';
        el.style.top = point.y + 'px';
      }
    };

    overlay.setMap(map);
  }

  private createWeatherHTML(weather: WeatherData): string {
    return `
      <div class="weather-content">
        <div class="current-weather">
          <img src="${weather.current.icon}" alt="${weather.current.conditions}" />
          <div class="temp">${Math.round(weather.current.temp)}°C</div>
          <div class="conditions">${weather.current.conditions}</div>
          <div class="wind">Wind: ${weather.current.windSpeed} m/s</div>
        </div>
        <div class="forecast">
          ${weather.forecast.map(day => `
            <div class="forecast-day">
              <div class="date">${day.timestamp.toLocaleDateString()}</div>
              <img src="${day.icon}" alt="${day.conditions}" />
              <div class="temp">${Math.round(day.temp)}°C</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
} 