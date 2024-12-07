import mapboxgl from 'mapbox-gl';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

if (!MAPBOX_TOKEN) {
  throw new Error('MAPBOX_TOKEN is required');
}

mapboxgl.accessToken = MAPBOX_TOKEN;

export interface MapOptions {
  container: HTMLElement;
  center?: [number, number];
  zoom?: number;
  style?: string;
}

export interface MapMarkerOptions {
  color?: string;
  draggable?: boolean;
}

class MapboxService {
  createMap(options: MapOptions): mapboxgl.Map {
    return new mapboxgl.Map({
      container: options.container,
      style: options.style || 'mapbox://styles/mapbox/dark-v11',
      center: options.center || [-74.5, 40],
      zoom: options.zoom || 9,
    });
  }

  createMarker(options: MapMarkerOptions = {}): mapboxgl.Marker {
    return new mapboxgl.Marker({
      color: options.color,
      draggable: options.draggable,
    });
  }

  async getRoute(start: [number, number], end: [number, number]): Promise<GeoJSON.Feature> {
    const query = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/cycling/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${MAPBOX_TOKEN}`
    );
    const json = await query.json();
    return json.routes[0];
  }

  async searchPlace(query: string): Promise<GeoJSON.Feature[]> {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        query
      )}.json?access_token=${MAPBOX_TOKEN}`
    );
    const json = await response.json();
    return json.features;
  }
}

export const mapboxService = new MapboxService(); 