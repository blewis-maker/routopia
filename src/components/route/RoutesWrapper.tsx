import React from 'react';
import { RoutePanel } from './RoutePanel';

interface Route {
  id: string;
  name: string;
  distance: number;
  elevation: number;
  duration?: number;
  difficulty?: string;
}

interface RoutesWrapperProps {
  routes: Route[];
  onRouteSelect?: (route: Route) => void;
  onRouteEdit?: (route: Route) => void;
  onRouteDelete?: (routeId: string) => void;
}

export const RoutesWrapper: React.FC<RoutesWrapperProps> = ({
  routes,
  onRouteSelect,
  onRouteEdit,
  onRouteDelete,
}) => {
  return (
    <div className="space-y-4">
      {routes.map((route) => (
        <div
          key={route.id}
          onClick={() => onRouteSelect?.(route)}
          className="cursor-pointer transition-transform hover:scale-[1.01]"
        >
          <RoutePanel
            route={route}
            onEdit={() => onRouteEdit?.(route)}
            onDelete={() => onRouteDelete?.(route.id)}
          />
        </div>
      ))}
      {routes.length === 0 && (
        <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
          No routes available
        </div>
      )}
    </div>
  );
};

export default RoutesWrapper; 