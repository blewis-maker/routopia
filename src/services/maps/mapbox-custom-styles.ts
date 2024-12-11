import mapboxgl from 'mapbox-gl';

interface MapThemeConfig {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  background: string;
  roads: string;
  water: string;
  landuse: string;
  buildings: string;
}

const THEME = {
  light: {
    primary: '#2A2B2E',
    secondary: '#494B50',
    accent: '#00B2B2',  // Your teal accent
    text: '#2A2B2E',
    background: '#F8F9FA',
    roads: '#FFFFFF',
    water: '#BFEFFF',
    landuse: '#E6E8E6',
    buildings: '#FFFFFF'
  },
  dark: {
    primary: '#F8F9FA',
    secondary: '#B4B6BA',
    accent: '#00B2B2',
    text: '#F8F9FA',
    background: '#2A2B2E',
    roads: '#494B50',
    water: '#193C3C',
    landuse: '#363839',
    buildings: '#494B50'
  }
} as const;

export class MapboxStyleManager {
  private map: mapboxgl.Map;
  private currentStyle: string;

  constructor(map: mapboxgl.Map) {
    this.map = map;
    this.currentStyle = 'mapbox://styles/mapbox/streets-v12';
  }

  setTheme(theme: 'light' | 'dark' | 'satellite') {
    if (!this.map) return;

    const styles = {
      light: 'mapbox://styles/mapbox/streets-v12',
      dark: 'mapbox://styles/mapbox/dark-v11',
      satellite: 'mapbox://styles/mapbox/satellite-streets-v12'
    };

    const newStyle = styles[theme];
    if (newStyle === this.currentStyle) return;

    // Store style state before change
    const center = this.map.getCenter();
    const zoom = this.map.getZoom();
    const bearing = this.map.getBearing();
    const pitch = this.map.getPitch();

    this.map.once('style.load', () => {
      // Restore state after style change
      this.map.setCenter(center);
      this.map.setZoom(zoom);
      this.map.setBearing(bearing);
      this.map.setPitch(pitch);
    });

    this.map.setStyle(newStyle);
    this.currentStyle = newStyle;
  }
} 