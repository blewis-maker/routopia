import React, { useEffect, useRef } from 'react';
import { BaseVisualizationLayer } from '../BaseVisualizationLayer';
import { useRouteVisualizationStore } from '@/store/visualization/routeVisualization.store';
import type { RouteVisualizationProps } from '@/types/components/RouteVisualization.types';

export const ElevationLayer: React.FC<RouteVisualizationProps> = (props) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const store = useRouteVisualizationStore();

  useEffect(() => {
    if (!svgRef.current || !props.overlays.elevation) return;
    
    // Render elevation profile
    renderElevationProfile(
      svgRef.current,
      props.overlays.elevation,
      props.theme?.colors.elevation
    );
  }, [props.overlays.elevation, props.theme]);

  return (
    <BaseVisualizationLayer {...props}>
      <svg ref={svgRef} className="elevation-layer" />
    </BaseVisualizationLayer>
  );
}; 