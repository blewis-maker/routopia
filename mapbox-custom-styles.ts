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
    accent: '#00B2B2',  // Teal accent from your UI
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

export class RoutopiaMapStyle {
  private map: mapboxgl.Map;
  private currentTheme: 'light' | 'dark' | 'satellite' = 'light';

  constructor(map: mapboxgl.Map) {
    this.map = map;
  }

  getCustomStyle(theme: 'light' | 'dark'): mapboxgl.Style {
    const colors = THEME[theme];
    
    return {
      version: 8,
      name: `routopia-${theme}`,
      sources: {
        'mapbox-streets': {
          type: 'vector',
          url: 'mapbox://mapbox.mapbox-streets-v8'
        }
      },
      layers: [
        // Background
        {
          id: 'background',
          type: 'background',
          paint: {
            'background-color': colors.background
          }
        },
        // Water bodies
        {
          id: 'water',
          type: 'fill',
          source: 'mapbox-streets',
          'source-layer': 'water',
          paint: {
            'fill-color': colors.water
          }
        },
        // Landuse areas
        {
          id: 'landuse',
          type: 'fill',
          source: 'mapbox-streets',
          'source-layer': 'landuse',
          paint: {
            'fill-color': colors.landuse
          }
        },
        // Buildings
        {
          id: 'buildings',
          type: 'fill',
          source: 'mapbox-streets',
          'source-layer': 'building',
          paint: {
            'fill-color': colors.buildings,
            'fill-opacity': 0.8
          }
        },
        // Roads - Highway
        {
          id: 'highway',
          type: 'line',
          source: 'mapbox-streets',
          'source-layer': 'road',
          filter: ['==', 'class', 'motorway'],
          paint: {
            'line-color': colors.accent,
            'line-width': {
              base: 1.4,
              stops: [[6, 0.5], [20, 30]]
            }
          }
        },
        // Roads - Major
        {
          id: 'major-roads',
          type: 'line',
          source: 'mapbox-streets',
          'source-layer': 'road',
          filter: ['==', 'class', 'main'],
          paint: {
            'line-color': colors.secondary,
            'line-width': {
              base: 1.4,
              stops: [[8, 1], [20, 20]]
            }
          }
        },
        // Roads - Minor
        {
          id: 'minor-roads',
          type: 'line',
          source: 'mapbox-streets',
          'source-layer': 'road',
          filter: ['==', 'class', 'street'],
          paint: {
            'line-color': colors.roads,
            'line-width': {
              base: 1.4,
              stops: [[13, 0.5], [20, 10]]
            }
          }
        },
        // Labels
        {
          id: 'place-labels',
          type: 'symbol',
          source: 'mapbox-streets',
          'source-layer': 'place_label',
          layout: {
            'text-field': ['get', 'name'],
            'text-font': ['IBM Plex Mono Bold'], // Retro terminal style font
            'text-size': 12
          },
          paint: {
            'text-color': colors.text,
            'text-halo-color': colors.background,
            'text-halo-width': 2
          }
        }
      ]
    };
  }

  setTheme(theme: 'light' | 'dark' | 'satellite'): void {
    if (theme === this.currentTheme) return;

    switch (theme) {
      case 'light':
      case 'dark':
        this.map.setStyle(this.getCustomStyle(theme));
        break;
      case 'satellite':
        this.map.setStyle('mapbox://styles/mapbox/satellite-streets-v12');
        break;
    }

    this.currentTheme = theme;
  }

  // Helper method to update colors at runtime
  updateThemeColors(colors: Partial<MapThemeConfig>, theme: 'light' | 'dark'): void {
    const currentColors = { ...THEME[theme], ...colors };
    
    // Update existing layers with new colors
    Object.entries(currentColors).forEach(([key, value]) => {
      const layers = this.map.getStyle().layers || [];
      layers.forEach(layer => {
        if (layer.id.includes(key)) {
          this.map.setPaintProperty(layer.id, 'fill-color', value);
        }
      });
    });
  }
}
