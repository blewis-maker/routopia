import React, { useMemo } from 'react';
import { BaseVisualizationLayer } from '../BaseVisualizationLayer';
import { useRouteVisualizationStore } from '@/store/visualization/routeVisualization.store';
import type { RouteVisualizationProps } from '@/types/components/RouteVisualization.types';

export const POIMarkers: React.FC<RouteVisualizationProps> = (props) => {
  const store = useRouteVisualizationStore();

  const clusteredMarkers = useMemo(() => {
    if (!props.overlays.poi) return [];
    return clusterMarkers(props.overlays.poi);
  }, [props.overlays.poi]);

  return (
    <BaseVisualizationLayer {...props}>
      <div className="poi-markers-container">
        {clusteredMarkers.map((cluster) => (
          <MarkerCluster
            key={cluster.id}
            cluster={cluster}
            theme={props.theme}
          />
        ))}
      </div>
    </BaseVisualizationLayer>
  );
}; 