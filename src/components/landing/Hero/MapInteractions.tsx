import { useCallback, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { LandingAnalytics } from '@/utils/analytics';

export function useMapInteractions(map: mapboxgl.Map | null) {
  const handleMapClick = useCallback((e: mapboxgl.MapMouseEvent) => {
    if (!map) return;

    const features = map.queryRenderedFeatures(e.point, {
      layers: ['hiking-preview']
    });

    if (features.length) {
      LandingAnalytics.track({
        name: 'feature_click',
        properties: { feature: 'route_interaction' }
      });

      // Highlight effect
      map.setPaintProperty('hiking-preview', 'line-color', '#34d399');
      setTimeout(() => {
        map.setPaintProperty('hiking-preview', 'line-color', '#2dd4bf');
      }, 300);
    }
  }, [map]);

  const handleMapHover = useCallback((e: mapboxgl.MapMouseEvent) => {
    if (!map) return;

    const features = map.queryRenderedFeatures(e.point, {
      layers: ['hiking-preview']
    });

    map.getCanvas().style.cursor = features.length ? 'pointer' : '';
  }, [map]);

  useEffect(() => {
    if (!map) return;

    map.on('click', handleMapClick);
    map.on('mousemove', handleMapHover);

    return () => {
      map.off('click', handleMapClick);
      map.off('mousemove', handleMapHover);
    };
  }, [map, handleMapClick, handleMapHover]);

  return null;
} 