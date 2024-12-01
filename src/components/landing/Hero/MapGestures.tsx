import { useEffect, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { LandingAnalytics } from '@/utils/analytics';

export function useMapGestures(map: mapboxgl.Map | null) {
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!map || e.touches.length !== 2) return;
    
    // Enable rotation for two finger gesture
    map.touchZoomRotate.enable();
    map.dragRotate.enable();
    
    LandingAnalytics.track({
      name: 'feature_click',
      properties: { feature: 'map_gesture_start' }
    });
  }, [map]);

  const handleTouchEnd = useCallback(() => {
    if (!map) return;
    
    // Disable rotation after gesture
    map.touchZoomRotate.disable();
    map.dragRotate.disable();
    
    // Smooth animation back to north
    map.easeTo({ bearing: 0, pitch: 0, duration: 1000 });
  }, [map]);

  useEffect(() => {
    if (!map) return;

    const canvas = map.getCanvas();
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchend', handleTouchEnd);

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [map, handleTouchStart, handleTouchEnd]);

  return null;
} 