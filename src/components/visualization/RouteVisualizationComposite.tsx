import React from 'react';
import { RouteLayer } from './layers/RouteLayer';
import { POIMarkers } from './layers/POIMarkers';
import { ElevationLayer } from './layers/ElevationLayer';
import { WeatherOverlay } from './layers/WeatherOverlay';
import type { RouteVisualizationProps } from '@/types/components/RouteVisualization.types';

export const RouteVisualizationComposite: React.FC<RouteVisualizationProps> = (props) => {
  return (
    <div className="route-visualization-composite" data-testid="route-visualization">
      {/* Base route layer */}
      <RouteLayer {...props} />

      {/* Elevation profile */}
      {props.overlays.elevation && (
        <ElevationLayer {...props} />
      )}

      {/* POI markers */}
      {props.overlays.poi && (
        <POIMarkers {...props} />
      )}

      {/* Weather overlay */}
      {props.overlays.weather && (
        <WeatherOverlay {...props} />
      )}

      {/* Performance monitoring */}
      {process.env.NODE_ENV === 'development' && (
        <PerformanceMonitor />
      )}
    </div>
  );
}; 