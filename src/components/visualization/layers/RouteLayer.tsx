import React, { useEffect, useRef } from 'react';
import { BaseVisualizationLayer } from '../BaseVisualizationLayer';
import { useRouteVisualizationStore } from '@/store/visualization/routeVisualization.store';
import type { RouteVisualizationProps } from '@/types/components/RouteVisualization.types';

export const RouteLayer: React.FC<RouteVisualizationProps> = (props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const store = useRouteVisualizationStore();

  useEffect(() => {
    if (!canvasRef.current || !props.route) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Render route
    renderRoute(ctx, props.route, props.theme?.colors.route);
  }, [props.route, props.theme]);

  return (
    <BaseVisualizationLayer {...props}>
      <canvas ref={canvasRef} className="route-layer" />
    </BaseVisualizationLayer>
  );
}; 