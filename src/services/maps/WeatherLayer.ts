import mapboxgl from 'mapbox-gl';
import { Coordinates } from './MapServiceInterface';
import { Loader } from '@googlemaps/js-api-loader';

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  precipitation: number;
  conditions: string;
  icon: string;
}

export class WeatherLayer {
  private loader: Loader;
  private weatherApiKey: string;

  constructor() {
    const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
    const weatherApiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

    if (!googleMapsKey) {
      throw new Error('Google Maps API key not found');
    }
    if (!weatherApiKey) {
      throw new Error('Weather API key not found');
    }

    this.weatherApiKey = weatherApiKey;
    this.loader = new Loader({
      apiKey: googleMapsKey,
      version: 'weekly'
    });
  }

  async getWeatherData(location: Coordinates): Promise<WeatherData> {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lng}&appid=${this.weatherApiKey}&units=metric`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const data = await response.json();
    return {
      temperature: data.main.temp,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      windDirection: data.wind.deg,
      precipitation: data.rain?.['1h'] || 0,
      conditions: data.weather[0].description,
      icon: data.weather[0].icon
    };
  }

  async showWeatherOverlay(map: mapboxgl.Map | google.maps.Map, location: Coordinates): Promise<void> {
    await this.loader.load();
    const weatherData = await this.getWeatherData(location);
    
    if ('addControl' in map) {
      await this.showMapboxWeatherOverlay(map as mapboxgl.Map, location, weatherData);
    } else {
      await this.showGoogleWeatherOverlay(map as google.maps.Map, location, weatherData);
    }
  }

  private async showMapboxWeatherOverlay(map: mapboxgl.Map, location: Coordinates, weather: WeatherData): Promise<void> {
    const el = this.createWeatherElement(weather);
    
    new mapboxgl.Marker(el)
      .setLngLat([location.lng, location.lat])
      .addTo(map);
  }

  private async showGoogleWeatherOverlay(map: google.maps.Map, location: Coordinates, weather: WeatherData): Promise<void> {
    const el = this.createWeatherElement(weather);
    
    const overlay = new google.maps.OverlayView();
    overlay.setMap(map);
    
    overlay.onAdd = () => {
      const panes = overlay.getPanes();
      panes.overlayLayer.appendChild(el);
    };
    
    overlay.draw = () => {
      const projection = overlay.getProjection();
      const position = projection.fromLatLngToDivPixel(
        new google.maps.LatLng(location.lat, location.lng)
      );
      
      if (position) {
        el.style.left = position.x + 'px';
        el.style.top = position.y + 'px';
      }
    };
  }

  private createWeatherElement(weather: WeatherData): HTMLElement {
    const el = document.createElement('div');
    el.className = 'weather-overlay';
    el.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    el.style.padding = '10px';
    el.style.borderRadius = '5px';
    el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
    
    el.innerHTML = `
      <div style="display: flex; align-items: center;">
        <img src="https://openweathermap.org/img/w/${weather.icon}.png" alt="${weather.conditions}">
        <div style="margin-left: 10px;">
          <div style="font-size: 16px; font-weight: bold;">${Math.round(weather.temperature)}°C</div>
          <div style="font-size: 12px;">${weather.conditions}</div>
          <div style="font-size: 12px;">Wind: ${Math.round(weather.windSpeed)} m/s</div>
        </div>
      </div>
    `;
    
    return el;
  }
} 