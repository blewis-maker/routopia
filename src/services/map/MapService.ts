import mapboxgl from 'mapbox-gl';

export class MapService {
  private map: mapboxgl.Map | null = null;

  async getCurrentLocation(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  async renderMap(container: HTMLElement): Promise<mapboxgl.Map> {
    if (!process.env.MAPBOX_TOKEN) {
      throw new Error('Mapbox token is not configured');
    }

    mapboxgl.accessToken = process.env.MAPBOX_TOKEN;

    this.map = new mapboxgl.Map({
      container,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-74.5, 40], // Default center
      zoom: 9
    });

    return new Promise((resolve, reject) => {
      this.map!.on('load', () => resolve(this.map!));
      this.map!.on('error', reject);
    });
  }

  getMap(): mapboxgl.Map | null {
    return this.map;
  }

  async centerOnLocation(lat: number, lng: number, zoom?: number): Promise<void> {
    if (!this.map) throw new Error('Map not initialized');
    
    this.map.flyTo({
      center: [lng, lat],
      zoom: zoom || this.map.getZoom(),
      essential: true
    });
  }
} 