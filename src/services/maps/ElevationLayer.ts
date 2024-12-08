import mapboxgl from 'mapbox-gl';
import { Coordinates } from './MapServiceInterface';
import { Loader } from '@googlemaps/js-api-loader';

export interface ElevationData {
  points: Array<{
    location: Coordinates;
    elevation: number;
  }>;
  minElevation: number;
  maxElevation: number;
  totalAscent: number;
  totalDescent: number;
}

export class ElevationLayer {
  private loader: Loader;
  private sourceId = 'elevation-data';
  private layerId = 'elevation-layer';

  constructor() {
    const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
    if (!googleMapsKey) {
      throw new Error('Google Maps API key not found');
    }

    this.loader = new Loader({
      apiKey: googleMapsKey,
      version: 'weekly',
      libraries: ['elevation']
    });
  }

  async getElevationData(path: Coordinates[]): Promise<ElevationData> {
    await this.loader.load();
    return this.getGoogleElevation(path);
  }

  private async getGoogleElevation(path: Coordinates[]): Promise<ElevationData> {
    const elevator = new google.maps.ElevationService();
    const result = await elevator.getElevationAlongPath({
      path: path.map(p => ({ lat: p.lat, lng: p.lng })),
      samples: Math.min(512, path.length * 2) // Google's limit is 512 samples
    });

    const points = result.results.map(point => ({
      location: {
        lat: point.location.lat(),
        lng: point.location.lng()
      },
      elevation: point.elevation
    }));

    // Calculate elevation statistics
    const elevations = points.map(p => p.elevation);
    const minElevation = Math.min(...elevations);
    const maxElevation = Math.max(...elevations);

    let totalAscent = 0;
    let totalDescent = 0;

    for (let i = 1; i < elevations.length; i++) {
      const diff = elevations[i] - elevations[i - 1];
      if (diff > 0) {
        totalAscent += diff;
      } else {
        totalDescent += Math.abs(diff);
      }
    }

    return {
      points,
      minElevation,
      maxElevation,
      totalAscent,
      totalDescent
    };
  }

  async visualizeElevation(map: mapboxgl.Map | google.maps.Map, data: ElevationData): Promise<void> {
    if (map instanceof mapboxgl.Map) {
      await this.visualizeMapboxElevation(map, data);
    } else {
      await this.visualizeGoogleElevation(map, data);
    }
  }

  private async visualizeMapboxElevation(map: mapboxgl.Map, data: ElevationData): Promise<void> {
    const geojson = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: data.points.map(p => [p.location.lng, p.location.lat])
      }
    };

    // Add or update the source
    if (!map.getSource(this.sourceId)) {
      map.addSource(this.sourceId, {
        type: 'geojson',
        data: geojson as any
      });
    } else {
      (map.getSource(this.sourceId) as mapboxgl.GeoJSONSource).setData(geojson as any);
    }

    // Add or update the layer
    if (!map.getLayer(this.layerId)) {
      map.addLayer({
        id: this.layerId,
        type: 'line',
        source: this.sourceId,
        paint: {
          'line-color': [
            'interpolate',
            ['linear'],
            ['get', 'elevation'],
            data.minElevation,
            '#396',
            data.maxElevation,
            '#939'
          ],
          'line-width': 4
        }
      });
    }
  }

  private async visualizeGoogleElevation(map: google.maps.Map, data: ElevationData): Promise<void> {
    await this.loader.importLibrary('visualization');
    
    const chartData = new google.visualization.DataTable();
    chartData.addColumn('number', 'Distance');
    chartData.addColumn('number', 'Elevation');

    const rows = data.points.map((point, index) => {
      const distance = index * (data.points.length / 100); // Approximate distance
      return [distance, point.elevation];
    });

    chartData.addRows(rows);

    const chartDiv = document.getElementById('elevation-chart');
    if (!chartDiv) {
      console.warn('Elevation chart container not found');
      return;
    }

    const chart = new google.visualization.AreaChart(chartDiv);
    chart.draw(chartData, {
      height: 150,
      legend: 'none',
      titleY: 'Elevation (m)',
      titleX: 'Distance (km)'
    });
  }
} 