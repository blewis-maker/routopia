import { ApiCache, CacheDuration } from '@/lib/cache/ApiCache';
import { RequestOptimizer } from '@/lib/api/RequestOptimizer';
import { Coordinates } from './MapServiceInterface';

export interface ElevationData {
  points: Array<{
    location: Coordinates;
    elevation: number;
    resolution: number;
  }>;
  maxElevation: number;
  minElevation: number;
  totalAscent: number;
  totalDescent: number;
}

export class ElevationLayer {
  private mapboxToken: string;
  private googleMapsKey: string;
  private cache: ApiCache;
  private optimizer: RequestOptimizer;

  constructor() {
    this.mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
    this.googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '';
    this.cache = ApiCache.getInstance();
    this.optimizer = RequestOptimizer.getInstance();
  }

  async getElevationProfile(path: Coordinates[]): Promise<ElevationData> {
    const cacheKey = `elevation:${this.generatePathHash(path)}`;
    const cached = this.cache.get<ElevationData>(cacheKey);
    if (cached) return cached;

    return this.optimizer.optimizedRequest(
      cacheKey,
      async () => {
        const data = await this._getElevationData(path);
        this.cache.set(cacheKey, data, CacheDuration.DAYS_7);
        return data;
      },
      {
        maxRetries: 2,
        failoverStrategy: 'cache'
      }
    );
  }

  private generatePathHash(path: Coordinates[]): string {
    return path.map(p => `${p.lat.toFixed(4)},${p.lng.toFixed(4)}`).join('|');
  }

  private async _getElevationData(path: Coordinates[]): Promise<ElevationData> {
    try {
      // Try Mapbox first
      if (this.mapboxToken) {
        return await this.getMapboxElevation(path);
      }
      // Fallback to Google Maps
      if (this.googleMapsKey) {
        return await this.getGoogleElevation(path);
      }
      throw new Error('No elevation service configured');
    } catch (error) {
      console.error('Elevation data fetch error:', error);
      throw error;
    }
  }

  private async getMapboxElevation(path: Coordinates[]): Promise<ElevationData> {
    const coordinates = path.map(p => `${p.lng},${p.lat}`).join(';');
    const response = await fetch(
      `https://api.mapbox.com/v4/mapbox.mapbox-terrain-v2/tilequery/${coordinates}?access_token=${this.mapboxToken}`
    );

    const data = await response.json();
    const points = data.features.map((f: any) => ({
      location: {
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0]
      },
      elevation: f.properties.ele,
      resolution: f.properties.tilesize
    }));

    return this.processElevationData(points);
  }

  private async getGoogleElevation(path: Coordinates[]): Promise<ElevationData> {
    const elevator = new google.maps.ElevationService();
    const result = await elevator.getElevationAlongPath({
      path: path.map(p => ({ lat: p.lat, lng: p.lng })),
      samples: Math.min(512, path.length * 2) // Google's limit is 512 samples
    });

    const points = result.map(point => ({
      location: {
        lat: point.location.lat(),
        lng: point.location.lng()
      },
      elevation: point.elevation,
      resolution: point.resolution
    }));

    return this.processElevationData(points);
  }

  private processElevationData(points: Array<{
    location: Coordinates;
    elevation: number;
    resolution: number;
  }>): ElevationData {
    let maxElevation = -Infinity;
    let minElevation = Infinity;
    let totalAscent = 0;
    let totalDescent = 0;

    points.forEach((point, i) => {
      maxElevation = Math.max(maxElevation, point.elevation);
      minElevation = Math.min(minElevation, point.elevation);

      if (i > 0) {
        const elevationDiff = point.elevation - points[i - 1].elevation;
        if (elevationDiff > 0) {
          totalAscent += elevationDiff;
        } else {
          totalDescent += Math.abs(elevationDiff);
        }
      }
    });

    return {
      points,
      maxElevation,
      minElevation,
      totalAscent,
      totalDescent
    };
  }

  async visualizeElevation(map: mapboxgl.Map | google.maps.Map, data: ElevationData): Promise<void> {
    // Implementation will depend on the map provider
    if (map instanceof mapboxgl.Map) {
      await this.visualizeMapboxElevation(map, data);
    } else {
      await this.visualizeGoogleElevation(map, data);
    }
  }

  private async visualizeMapboxElevation(map: mapboxgl.Map, data: ElevationData): Promise<void> {
    const sourceId = 'elevation-data';
    const layerId = 'elevation-layer';

    // Create a GeoJSON line with elevation data
    const geojson = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: data.points.map(p => [p.location.lng, p.location.lat, p.elevation])
      }
    };

    // Add or update the source
    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: 'geojson',
        data: geojson
      });
    } else {
      (map.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(geojson);
    }

    // Add or update the layer
    if (!map.getLayer(layerId)) {
      map.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': [
            'interpolate',
            ['linear'],
            ['get', 'elevation'],
            data.minElevation, '#00ff00',
            data.maxElevation, '#ff0000'
          ],
          'line-width': 4
        }
      });
    }
  }

  private async visualizeGoogleElevation(map: google.maps.Map, data: ElevationData): Promise<void> {
    // Create elevation chart using Google Charts
    const chartData = new google.visualization.DataTable();
    chartData.addColumn('number', 'Distance');
    chartData.addColumn('number', 'Elevation');

    const rows = data.points.map((point, index) => {
      const distance = index * 0.1; // Approximate distance in km
      return [distance, point.elevation];
    });

    chartData.addRows(rows);

    const chart = new google.visualization.AreaChart(
      document.getElementById('elevation-chart')!
    );

    chart.draw(chartData, {
      height: 150,
      legend: 'none',
      titleY: 'Elevation (m)'
    });
  }
} 