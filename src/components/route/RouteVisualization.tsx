import React from 'react';
import type { RouteData, ActivityType } from '@/types/routes';

interface Props {
  route: RouteData;
  activityType: ActivityType;
  alternatives?: RouteData[];
  onRouteClick?: (index: number) => void;
}

export const RouteVisualization: React.FC<Props> = ({
  route,
  activityType,
  alternatives = [],
  onRouteClick
}) => {
  return (
    <div className="route-visualization">
      {/* Route rendering will be handled by the map layer */}
      {/* This component handles styling and interaction logic */}
    </div>
  );
}; 