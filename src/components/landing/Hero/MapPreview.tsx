'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { mapConfig, addRouteLayer } from '@/utils/map-config';
import { LandingAnalytics } from '@/utils/analytics';
import { MapControls } from './MapControls';
import { RouteAnimations } from '@/utils/map-animations';
import { WeatherOverlay } from './WeatherOverlay';
import { LocationMarkers } from './LocationMarkers';
import { useMapInteractions } from './MapInteractions';
import { useMapGestures } from './MapGestures';
import { RouteStats } from './RouteStats';
import { useTerrainLayer } from './TerrainLayer';
import { RouteAlternatives } from './RouteAlternatives';

export default function MapPreview() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapConfig.style,
      center: mapConfig.defaultCenter,
      zoom: mapConfig.defaultZoom,
      interactive: true, // Enable basic interactions
      attributionControl: false
    });

    map.current.on('load', () => {
      if (!map.current) return;
      
      // Add the preview route
      addRouteLayer(map.current, 'hiking-preview');
      
      // Animate the route
      RouteAnimations.animateRoute(map.current, 'hiking-preview');
      
      setIsLoaded(true);
      LandingAnalytics.track({
        name: 'feature_click',
        properties: { feature: 'map_preview_loaded' }
      });
    });

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, []);

  // Add map interactions
  useMapInteractions(map.current);

  // Add new hooks
  useMapGestures(map.current);
  useTerrainLayer(map.current);

  const handleZoomIn = () => {
    if (!map.current) return;
    map.current.zoomIn();
    LandingAnalytics.track({
      name: 'feature_click',
      properties: { feature: 'map_zoom_in' }
    });
  };

  const handleZoomOut = () => {
    if (!map.current) return;
    map.current.zoomOut();
    LandingAnalytics.track({
      name: 'feature_click',
      properties: { feature: 'map_zoom_out' }
    });
  };

  return (
    <div className="relative aspect-video rounded-lg overflow-hidden group">
      <div 
        ref={mapContainer} 
        className="absolute inset-0 transition-transform duration-300 group-hover:scale-105"
        aria-label="Interactive map preview"
      />
      
      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent pointer-events-none" />
      
      {isLoaded && (
        <>
          <WeatherOverlay map={map.current} />
          <RouteAlternatives map={map.current} />
          <LocationMarkers map={map.current} />
          <RouteStats map={map.current} />
          <MapControls 
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
          />
        </>
      )}
    </div>
  );
} 