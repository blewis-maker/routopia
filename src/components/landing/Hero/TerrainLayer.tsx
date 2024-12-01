import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

export function useTerrainLayer(map: mapboxgl.Map | null) {
  useEffect(() => {
    if (!map) return;

    map.on('load', () => {
      // Add terrain source
      map.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14
      });

      // Add terrain layer
      map.setTerrain({ 
        source: 'mapbox-dem', 
        exaggeration: 1.5 
      });

      // Add sky layer
      map.addLayer({
        id: 'sky',
        type: 'sky',
        paint: {
          'sky-type': 'atmosphere',
          'sky-atmosphere-sun': [0.0, 90.0],
          'sky-atmosphere-sun-intensity': 15
        }
      });

      // Add contour lines
      map.addLayer({
        id: 'contours',
        type: 'line',
        source: {
          type: 'vector',
          url: 'mapbox://mapbox.mapbox-terrain-v2'
        },
        'source-layer': 'contour',
        paint: {
          'line-color': '#2dd4bf',
          'line-opacity': 0.2,
          'line-width': 1
        }
      });
    });
  }, [map]);

  return null;
} 