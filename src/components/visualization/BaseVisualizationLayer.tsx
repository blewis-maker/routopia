import React from 'react';
import { useRouteVisualizationStore } from '@/store/visualization/routeVisualization.store';
import { useRouteInteractions } from '@/hooks/visualization/useRouteInteractions';
import type { RouteVisualizationProps } from '@/types/components/RouteVisualization.types';

export const BaseVisualizationLayer: React.FC<RouteVisualizationProps> = (props) => {
  const store = useRouteVisualizationStore();
  const { handleInteraction, interactionState } = useRouteInteractions(props);

  // Performance optimization
  const renderMode = props.renderMode || 'quality';
  const updateStrategy = props.updateStrategy || 'immediate';

  return (
    <div className="visualization-layer" data-testid="visualization-layer">
      {/* Layer controls */}
      <div className="layer-controls">
        {props.customControls}
        <div className="default-controls">
          {/* Add default controls */}
        </div>
      </div>

      {/* Render layers */}
      <div className="layer-container" style={{ position: 'relative' }}>
        {props.children}
      </div>

      {/* Performance monitoring */}
      {process.env.NODE_ENV === 'development' && (
        <div className="performance-metrics">
          <span>FPS: {store.performance.frameRate}</span>
          <span>Render Time: {store.performance.renderTime}ms</span>
        </div>
      )}
    </div>
  );
}; 